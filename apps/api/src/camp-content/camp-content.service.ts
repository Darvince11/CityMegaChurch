import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, sql } from 'drizzle-orm';
import {
  announcements,
  auditLogs,
  galleryPhotos,
  campBeds,
  campBookings,
  camps,
  serviceUpdates,
  sermons,
  users,
  type Database,
} from '@cdp/database';
import { ConflictError, NotFoundError, type AccommodationInput, type AnnouncementInput, type AuthUser, type CreateBooking, type GalleryPhotoInput, type ReviewBooking, type SermonInput, type ServiceUpdateInput } from '@cdp/shared';
import { DATABASE } from '../database/database.module';

@Injectable()
export class CampContentService {
  private readonly albumCache = new Map<string, { expires: number; photos: string[] }>();
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async memberOverview(userId: string) {
    const [booking] = await this.db.select({ id: campBookings.id, status: campBookings.status, createdAt: campBookings.createdAt, campTitle: camps.title, startsAt: camps.startsAt, location: camps.location, bedLabel: campBeds.label, room: campBeds.room, pricePesewas: campBeds.pricePesewas })
      .from(campBookings).innerJoin(camps, eq(campBookings.campId, camps.id)).innerJoin(campBeds, eq(campBookings.bedId, campBeds.id))
      .where(eq(campBookings.userId, userId)).orderBy(desc(campBookings.createdAt)).limit(1);
    const openCamps = await this.openCamps();
    return { booking: booking ?? null, camps: openCamps };
  }

  async openCamps() {
    const campRows = await this.db.select().from(camps).where(eq(camps.status, 'open')).orderBy(camps.startsAt);
    return Promise.all(campRows.map(async (camp) => ({ ...camp, beds: await this.db.select().from(campBeds).where(eq(campBeds.campId, camp.id)).orderBy(campBeds.room) })));
  }

  async book(userId: string, input: CreateBooking) {
    return this.db.transaction(async (tx) => {
      const [camp] = await tx.select().from(camps).where(and(eq(camps.id, input.campId), eq(camps.status, 'open'))).limit(1);
      if (!camp) throw new NotFoundError('This camp is not accepting bookings.');
      const [existing] = await tx.select({ id: campBookings.id, status: campBookings.status }).from(campBookings).where(and(eq(campBookings.campId, input.campId), eq(campBookings.userId, userId))).limit(1);
      if (existing && existing.status !== 'declined') throw new ConflictError('You already have a booking for this camp.');
      const [bed] = await tx.select().from(campBeds).where(and(eq(campBeds.id, input.bedId), eq(campBeds.campId, input.campId))).limit(1);
      if (!bed) throw new NotFoundError('That bed is no longer available.');
      const reserved = await tx.execute(sql`UPDATE camp_beds SET booked_count = booked_count + 1 WHERE id = ${bed.id} AND booked_count < capacity RETURNING id`);
      if (reserved.rowCount !== 1) throw new ConflictError('That bed has just been reserved. Please choose another one.');
      const details = { bookingName: input.fullName, bookingPhone: input.phone, memberGroup: input.group };
      const [booking] = existing
        ? await tx.update(campBookings).set({ ...details, bedId: input.bedId, notes: input.notes ?? null, status: 'pending', reviewedById: null, reviewedAt: null, createdAt: new Date() }).where(eq(campBookings.id, existing.id)).returning()
        : await tx.insert(campBookings).values({ ...details, campId: input.campId, bedId: input.bedId, userId, notes: input.notes ?? null, status: 'pending' }).returning();
      return booking;
    });
  }

  async adminBookings() {
    return this.db.select({ id: campBookings.id, status: campBookings.status, notes: campBookings.notes, createdAt: campBookings.createdAt, memberName: campBookings.bookingName, memberEmail: users.email, memberPhone: campBookings.bookingPhone, memberGroup: campBookings.memberGroup, campTitle: camps.title, bedLabel: campBeds.label, room: campBeds.room })
      .from(campBookings).innerJoin(users, eq(campBookings.userId, users.id)).innerJoin(camps, eq(campBookings.campId, camps.id)).innerJoin(campBeds, eq(campBookings.bedId, campBeds.id)).orderBy(desc(campBookings.createdAt));
  }

  async reviewBooking(id: string, reviewer: AuthUser, input: ReviewBooking) {
    const [booking] = await this.db.select().from(campBookings).where(eq(campBookings.id, id)).limit(1);
    if (!booking) throw new NotFoundError('Booking not found.');
    if (booking.status !== 'pending') throw new ConflictError('This booking has already been reviewed.');
    await this.db.transaction(async (tx) => {
      await tx.update(campBookings).set({ status: input.status, reviewedById: reviewer.id, reviewedAt: new Date() }).where(eq(campBookings.id, id));
      if (input.status === 'declined') await tx.update(campBeds).set({ bookedCount: sql`${campBeds.bookedCount} - 1` }).where(eq(campBeds.id, booking.bedId));
    });
    await this.log(reviewer, input.status, 'camp booking', id, `${input.status === 'approved' ? 'Approved' : 'Declined'} a member camp bed request`);
    return { id, status: input.status };
  }

  async updateAccommodation(id: string, user: AuthUser, input: AccommodationInput) {
    const [item] = await this.db.update(campBeds).set({ room: input.name, pricePesewas: input.pricePesewas, capacity: input.capacity }).where(eq(campBeds.id, id)).returning();
    if (!item) throw new NotFoundError('Accommodation option not found.');
    await this.log(user, 'updated', 'camp accommodation', id, `Updated ${item.room}, capacity and price`);
    return item;
  }

  async resetCamp(campId: string, user: AuthUser) {
    const [camp] = await this.db.select().from(camps).where(eq(camps.id, campId)).limit(1);
    if (!camp) throw new NotFoundError('Camp not found.');
    await this.db.transaction(async (tx) => {
      await tx.delete(campBookings).where(eq(campBookings.campId, campId));
      await tx.update(campBeds).set({ bookedCount: 0 }).where(eq(campBeds.campId, campId));
    });
    await this.log(user, 'reset', 'camp bookings', campId, `Reset all accommodation bookings for ${camp.title}`);
    return { campId, reset: true };
  }

  async dashboard() {
    const [memberCount] = await this.db.select({ count: sql<number>`count(*)::int` }).from(users);
    const [bookingCount] = await this.db.select({ count: sql<number>`count(*)::int` }).from(campBookings);
    const [pendingCount] = await this.db.select({ count: sql<number>`count(*)::int` }).from(campBookings).where(eq(campBookings.status, 'pending'));
    const [approvedCount] = await this.db.select({ count: sql<number>`count(*)::int` }).from(campBookings).where(eq(campBookings.status, 'approved'));
    const recentBookings = await this.adminBookings();
    return { metrics: { members: memberCount?.count ?? 0, bookings: bookingCount?.count ?? 0, pending: pendingCount?.count ?? 0, approved: approvedCount?.count ?? 0 }, recentBookings: recentBookings.slice(0, 12), camps: await this.openCamps(), announcements: await this.listAnnouncements(), serviceUpdates: await this.listServiceUpdates(), sermons: await this.listSermons(), galleryPhotos: await this.listGalleryPhotos(), auditLogs: await this.listAuditLogs() };
  }

  async listAnnouncements() { return this.db.select().from(announcements).orderBy(desc(announcements.publishedAt)).limit(12); }
  async listServiceUpdates() { return this.db.select().from(serviceUpdates).orderBy(desc(serviceUpdates.serviceDate)).limit(12); }
  async listSermons() { return this.db.select().from(sermons).orderBy(desc(sermons.preachedAt)).limit(24); }
  async listGalleryPhotos(expandAlbums = false) {
    const rows = await this.db.select().from(galleryPhotos).orderBy(desc(galleryPhotos.createdAt)).limit(60);
    if (!expandAlbums) return rows;
    const expanded = await Promise.all(rows.map(async (row) => {
      if (!row.imageUrl.includes('photos.app.goo.gl') && !row.imageUrl.includes('photos.google.com')) return [row];
      const urls = await this.resolveGooglePhotosAlbum(row.imageUrl);
      return urls.map((imageUrl, index) => ({ ...row, id: `${row.id}-${index}`, imageUrl, title: urls.length > 1 ? `${row.title} ${index + 1}` : row.title }));
    }));
    return expanded.flat().sort(() => Math.random() - 0.5);
  }

  private async resolveGooglePhotosAlbum(albumUrl: string): Promise<string[]> {
    const cached = this.albumCache.get(albumUrl);
    if (cached && cached.expires > Date.now()) return cached.photos;
    try {
      const source = new URL(albumUrl);
      if (!['photos.app.goo.gl', 'photos.google.com'].includes(source.hostname)) return [];
      const response = await fetch(source, { redirect: 'follow', signal: AbortSignal.timeout(5_000), headers: { 'user-agent': 'Mozilla/5.0 CityMegaChurchGallery/1.0' } });
      if (!response.ok) return [];
      const destination = new URL(response.url);
      if (!destination.hostname.endsWith('.google.com') && destination.hostname !== 'photos.google.com') return [];
      const html = (await response.text()).replaceAll('\\u003d', '=').replaceAll('\\u0026', '&').replaceAll('\\/', '/');
      const matches = html.match(/https:\/\/lh3\.googleusercontent\.com\/[A-Za-z0-9_?=&%./:+~-]+/g) ?? [];
      const photos = [...new Set(matches.map((url) => url.replace(/=w\d+.*$/, '=w1000')).filter((url) => !url.includes('profile')))]
        .sort(() => Math.random() - 0.5)
        .slice(0, 24);
      this.albumCache.set(albumUrl, { expires: Date.now() + 15 * 60 * 1000, photos });
      return photos;
    } catch { return []; }
  }
  async listAuditLogs() { return this.db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(100); }
  private async log(user: AuthUser, action: string, entityType: string, entityId: string | null, details: string) { await this.db.insert(auditLogs).values({ userId: user.id, actorName: user.fullName, action, entityType, entityId, details }); }
  async createAnnouncement(user: AuthUser, input: AnnouncementInput) { const [item] = await this.db.insert(announcements).values({ ...input, createdById: user.id }).returning(); if (item) await this.log(user, 'created', 'announcement', item.id, `Created announcement: ${item.title}`); return item; }
  async updateAnnouncement(id: string, user: AuthUser, input: AnnouncementInput) { const [item] = await this.db.update(announcements).set(input).where(eq(announcements.id, id)).returning(); if (!item) throw new NotFoundError('Announcement not found.'); await this.log(user, 'updated', 'announcement', id, `Updated announcement: ${item.title}`); return item; }
  async deleteAnnouncement(id: string, user: AuthUser) { const [item] = await this.db.delete(announcements).where(eq(announcements.id, id)).returning(); if (!item) throw new NotFoundError('Announcement not found.'); await this.log(user, 'deleted', 'announcement', id, `Deleted announcement: ${item.title}`); return { id }; }
  async createServiceUpdate(user: AuthUser, input: ServiceUpdateInput) { const [item] = await this.db.insert(serviceUpdates).values({ ...input, serviceDate: new Date(input.serviceDate), createdById: user.id }).returning(); if (item) await this.log(user, 'created', 'service update', item.id, `Published service update: ${item.title}`); return item; }
  async updateServiceUpdate(id: string, user: AuthUser, input: ServiceUpdateInput) { const [item] = await this.db.update(serviceUpdates).set({ ...input, serviceDate: new Date(input.serviceDate) }).where(eq(serviceUpdates.id, id)).returning(); if (!item) throw new NotFoundError('Service update not found.'); await this.log(user, 'updated', 'service update', id, `Updated service post: ${item.title}`); return item; }
  async deleteServiceUpdate(id: string, user: AuthUser) { const [item] = await this.db.delete(serviceUpdates).where(eq(serviceUpdates.id, id)).returning(); if (!item) throw new NotFoundError('Service update not found.'); await this.log(user, 'deleted', 'service update', id, `Deleted service post: ${item.title}`); return { id }; }
  async createSermon(user: AuthUser, input: SermonInput) { const [item] = await this.db.insert(sermons).values({ ...input, preachedAt: new Date(input.preachedAt), createdById: user.id }).returning(); if (item) await this.log(user, 'created', 'sermon', item.id, `Published sermon: ${item.title}`); return item; }
  async updateSermon(id: string, user: AuthUser, input: SermonInput) { const [item] = await this.db.update(sermons).set({ ...input, preachedAt: new Date(input.preachedAt) }).where(eq(sermons.id, id)).returning(); if (!item) throw new NotFoundError('Sermon not found.'); await this.log(user, 'updated', 'sermon', id, `Updated sermon: ${item.title}`); return item; }
  async deleteSermon(id: string, user: AuthUser) { const [item] = await this.db.delete(sermons).where(eq(sermons.id, id)).returning(); if (!item) throw new NotFoundError('Sermon not found.'); await this.log(user, 'deleted', 'sermon', id, `Deleted sermon: ${item.title}`); return { id }; }
  async createGalleryPhoto(user: AuthUser, input: GalleryPhotoInput) { const [item] = await this.db.insert(galleryPhotos).values({ ...input, caption: input.caption ?? null, createdById: user.id }).returning(); if (item) await this.log(user, 'created', 'gallery photo', item.id, `Added gallery photo: ${item.title}`); return item; }
  async deleteGalleryPhoto(id: string, user: AuthUser) { const [item] = await this.db.delete(galleryPhotos).where(eq(galleryPhotos.id, id)).returning(); if (!item) throw new NotFoundError('Gallery photo not found.'); await this.log(user, 'deleted', 'gallery photo', id, `Deleted gallery photo: ${item.title}`); return { id }; }
}
