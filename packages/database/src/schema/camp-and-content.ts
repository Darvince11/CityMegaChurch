import { integer, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';
import { users } from './users';

export const camps = pgTable('camps', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 160 }).notNull(),
  startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
  endsAt: timestamp('ends_at', { withTimezone: true }).notNull(),
  location: varchar('location', { length: 200 }).notNull(),
  description: text('description').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('open'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const campBeds = pgTable('camp_beds', {
  id: uuid('id').primaryKey().defaultRandom(),
  campId: uuid('camp_id').notNull().references(() => camps.id, { onDelete: 'cascade' }),
  label: varchar('label', { length: 120 }).notNull(),
  room: varchar('room', { length: 120 }).notNull(),
  capacity: integer('capacity').notNull().default(1),
  bookedCount: integer('booked_count').notNull().default(0),
  pricePesewas: integer('price_pesewas').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const campBookings = pgTable('camp_bookings', {
  id: uuid('id').primaryKey().defaultRandom(),
  campId: uuid('camp_id').notNull().references(() => camps.id, { onDelete: 'cascade' }),
  bedId: uuid('bed_id').notNull().references(() => campBeds.id, { onDelete: 'restrict' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  bookingName: varchar('booking_name', { length: 120 }).notNull().default('Member'),
  bookingPhone: varchar('booking_phone', { length: 20 }).notNull().default('000000000'),
  memberGroup: varchar('member_group', { length: 20 }).notNull().default('Group 1'),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  notes: text('notes'),
  reviewedById: uuid('reviewed_by_id').references(() => users.id, { onDelete: 'set null' }),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [uniqueIndex('camp_bookings_one_per_member').on(table.campId, table.userId)]);

export const announcements = pgTable('announcements', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 160 }).notNull(),
  body: text('body').notNull(),
  kind: varchar('kind', { length: 30 }).notNull().default('general'),
  publishedAt: timestamp('published_at', { withTimezone: true }).notNull().defaultNow(),
  createdById: uuid('created_by_id').references(() => users.id, { onDelete: 'set null' }),
});

export const serviceUpdates = pgTable('service_updates', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 160 }).notNull(),
  pastor: varchar('pastor', { length: 120 }),
  sermonTitle: varchar('sermon_title', { length: 180 }),
  summary: text('summary').notNull(),
  imageUrl: text('image_url'),
  serviceDate: timestamp('service_date', { withTimezone: true }).notNull(),
  createdById: uuid('created_by_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const sermons = pgTable('sermons', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 180 }).notNull(),
  speaker: varchar('speaker', { length: 120 }).notNull(),
  summary: text('summary').notNull(),
  videoUrl: text('video_url'),
  preachedAt: timestamp('preached_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  createdById: uuid('created_by_id').references(() => users.id, { onDelete: 'set null' }),
});

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  actorName: varchar('actor_name', { length: 160 }).notNull(),
  action: varchar('action', { length: 80 }).notNull(),
  entityType: varchar('entity_type', { length: 80 }).notNull(),
  entityId: uuid('entity_id'),
  details: text('details').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const galleryPhotos = pgTable('gallery_photos', {
  id: uuid('id').primaryKey().defaultRandom(),
  imageUrl: text('image_url').notNull(),
  title: varchar('title', { length: 160 }).notNull(),
  caption: text('caption'),
  createdById: uuid('created_by_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
