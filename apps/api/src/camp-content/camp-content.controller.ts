import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { AccommodationSchema, AnnouncementSchema, CreateBookingSchema, GalleryPhotoSchema, ReviewBookingSchema, SermonSchema, ServiceUpdateSchema, type AccommodationInput, type AnnouncementInput, type CreateBooking, type GalleryPhotoInput, type ReviewBooking, type SermonInput, type ServiceUpdateInput } from '@cdp/shared';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Public } from '../auth/decorators/public.decorator';
import type { AuthUser } from '@cdp/shared';
import { CampContentService } from './camp-content.service';

@Controller()
export class CampContentController {
  constructor(private readonly service: CampContentService) {}
  @Public() @Get('public/home-content') async homeContent() { return { announcements: await this.service.listAnnouncements(), serviceUpdates: await this.service.listServiceUpdates(), camps: await this.service.openCamps() }; }
  @Public() @Get('public/announcements') async announcements() { return this.service.listAnnouncements(); }
  @Public() @Get('public/sermons') async sermons() { return this.service.listSermons(); }
  @Public() @Get('public/gallery') async gallery() { return this.service.listGalleryPhotos(true); }
  @Get('member/overview') async overview(@CurrentUser() user: AuthUser) { return this.service.memberOverview(user.id); }
  @Post('member/camp-bookings') async book(@CurrentUser() user: AuthUser, @Body() body: unknown) { return this.service.book(user.id, CreateBookingSchema.parse(body) as CreateBooking); }
  @Permissions('camp.registration.read') @Get('admin/camp-bookings') async bookings() { return this.service.adminBookings(); }
  @Permissions('camp.registration.manage') @Patch('admin/camp-bookings/:id') async review(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @CurrentUser() user: AuthUser, @Body() body: unknown) { return this.service.reviewBooking(id, user, ReviewBookingSchema.parse(body) as ReviewBooking); }
  @Permissions('camp.registration.manage') @Patch('admin/accommodations/:id') async accommodation(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @CurrentUser() user: AuthUser, @Body() body: unknown) { return this.service.updateAccommodation(id, user, AccommodationSchema.parse(body) as AccommodationInput); }
  @Permissions('camp.registration.manage') @Post('admin/camps/:id/reset-bookings') async resetCamp(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @CurrentUser() user: AuthUser) { return this.service.resetCamp(id, user); }
  @Permissions('reports.read_all') @Get('admin/dashboard') async dashboard() { return this.service.dashboard(); }
  @Permissions('announcements.manage') @Post('admin/announcements') async announcement(@CurrentUser() user: AuthUser, @Body() body: unknown) { return this.service.createAnnouncement(user, AnnouncementSchema.parse(body) as AnnouncementInput); }
  @Permissions('announcements.manage') @Patch('admin/announcements/:id') async updateAnnouncement(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @CurrentUser() user: AuthUser, @Body() body: unknown) { return this.service.updateAnnouncement(id, user, AnnouncementSchema.parse(body) as AnnouncementInput); }
  @Permissions('announcements.manage') @Delete('admin/announcements/:id') async deleteAnnouncement(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @CurrentUser() user: AuthUser) { return this.service.deleteAnnouncement(id, user); }
  @Permissions('sermons.update') @Post('admin/service-updates') async update(@CurrentUser() user: AuthUser, @Body() body: unknown) { return this.service.createServiceUpdate(user, ServiceUpdateSchema.parse(body) as ServiceUpdateInput); }
  @Permissions('sermons.update') @Patch('admin/service-updates/:id') async editUpdate(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @CurrentUser() user: AuthUser, @Body() body: unknown) { return this.service.updateServiceUpdate(id, user, ServiceUpdateSchema.parse(body) as ServiceUpdateInput); }
  @Permissions('sermons.delete') @Delete('admin/service-updates/:id') async deleteUpdate(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @CurrentUser() user: AuthUser) { return this.service.deleteServiceUpdate(id, user); }
  @Permissions('sermons.create') @Post('admin/sermons') async sermon(@CurrentUser() user: AuthUser, @Body() body: unknown) { return this.service.createSermon(user, SermonSchema.parse(body) as SermonInput); }
  @Permissions('sermons.update') @Patch('admin/sermons/:id') async editSermon(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @CurrentUser() user: AuthUser, @Body() body: unknown) { return this.service.updateSermon(id, user, SermonSchema.parse(body) as SermonInput); }
  @Permissions('sermons.delete') @Delete('admin/sermons/:id') async deleteSermon(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @CurrentUser() user: AuthUser) { return this.service.deleteSermon(id, user); }
  @Permissions('media.upload') @Post('admin/gallery') async galleryPhoto(@CurrentUser() user: AuthUser, @Body() body: unknown) { return this.service.createGalleryPhoto(user, GalleryPhotoSchema.parse(body) as GalleryPhotoInput); }
  @Permissions('media.delete') @Delete('admin/gallery/:id') async deleteGalleryPhoto(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @CurrentUser() user: AuthUser) { return this.service.deleteGalleryPhoto(id, user); }
}
