import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { users } from './users';

/** Atomic capability catalog. `key` is the contract (docs/RBAC.md §3). */
export const permissions = pgTable('permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: varchar('key', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 120 }).notNull(),
  description: text('description'),
  module: varchar('module', { length: 60 }).notNull(),
});

export type Permission = typeof permissions.$inferSelect;
export type NewPermission = typeof permissions.$inferInsert;

/** Named bundles of permissions. `slug` is the stable identity. */
export const roles = pgTable('roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 60 }).notNull().unique(),
  name: varchar('name', { length: 80 }).notNull(),
  description: text('description'),
  /** System roles seed from the catalog and cannot be deleted. */
  isSystem: boolean('is_system').notNull().default(true),
  /** Roles that force TOTP enrollment (docs/RBAC.md §9). */
  requires2fa: boolean('requires_2fa').notNull().default(false),
});

export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;

/** N:M user ↔ roles. Effective permission set = union of all roles. */
export const userRoles = pgTable(
  'user_roles',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.userId, t.roleId] })],
);

export type UserRole = typeof userRoles.$inferInsert;

/** N:M role ↔ permissions. */
export const rolePermissions = pgTable(
  'role_permissions',
  {
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    permissionId: uuid('permission_id')
      .notNull()
      .references(() => permissions.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.roleId, t.permissionId] })],
);

export type RolePermission = typeof rolePermissions.$inferInsert;

/**
 * Organizational rank ONLY — Pastor → Group Leader → Secretary →
 * Fellowship Leader → Member. Never used to authorize system actions
 * (docs/RBAC.md §1).
 */
export const churchPositions = pgTable('church_positions', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 60 }).notNull().unique(),
  hierarchyLevel: integer('hierarchy_level').notNull(),
});

export type ChurchPosition = typeof churchPositions.$inferSelect;

/** Member-facing profile data; deliberately separate from the login identity. */
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  churchPositionId: uuid('church_position_id').references(() => churchPositions.id, {
    onDelete: 'set null',
  }),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;