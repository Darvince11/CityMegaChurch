import 'dotenv/config';
import { eq } from 'drizzle-orm';
import argon2 from 'argon2';
import { createDbHandle } from '../src/client';
import {
  churchPositions,
  permissions,
  profiles,
  rolePermissions,
  roles,
  userRoles,
  users,
} from '../src/schema';
import { churchPositionSeeds, permissionCatalog, roleCatalog } from './catalog';

const isProduction = process.env.NODE_ENV === 'production';
const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL ?? 'superadmin@church.test';
const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD ?? 'Test@1234';

async function seed(): Promise<void> {
  if (isProduction && process.env.SEED_STRICT !== 'true') {
    throw new Error('Refusing to seed production without SEED_STRICT=true');
  }
  if (isProduction && (!process.env.SUPERADMIN_PASSWORD || SUPERADMIN_PASSWORD.length < 12 || SUPERADMIN_PASSWORD === 'Test@1234')) {
    throw new Error('Production requires a unique SUPERADMIN_PASSWORD of at least 12 characters');
  }

  const { db, pool } = createDbHandle();
  try {
    // Authorization catalogs are required application configuration, not sample content.
    for (const position of churchPositionSeeds) {
      await db.insert(churchPositions).values(position).onConflictDoUpdate({
        target: churchPositions.name,
        set: { hierarchyLevel: position.hierarchyLevel },
      });
    }

    for (const permission of permissionCatalog) {
      await db.insert(permissions).values(permission).onConflictDoUpdate({
        target: permissions.key,
        set: { name: permission.name, module: permission.module, description: permission.description },
      });
    }

    const catalogKeys = new Set(permissionCatalog.map((permission) => permission.key));
    const permissionRows = await db.select().from(permissions);
    const permissionByKey = new Map(permissionRows.map((permission) => [permission.key, permission]));

    for (const role of roleCatalog) {
      const unknownKeys = role.permissions.filter((key) => key !== '*' && !catalogKeys.has(key));
      if (unknownKeys.length > 0) throw new Error(`Role ${role.slug} references unknown permissions: ${unknownKeys.join(', ')}`);
      if (role.permissions.includes('*') && role.permissions.length !== 1) throw new Error(`Role ${role.slug} must use '*' by itself`);

      const [roleRow] = await db.insert(roles).values(role).onConflictDoUpdate({
        target: roles.slug,
        set: { name: role.name, description: role.description, requires2fa: role.requires2fa },
      }).returning();
      if (!roleRow) continue;

      const keys = role.permissions.includes('*') ? permissionCatalog.map((permission) => permission.key) : role.permissions;
      await db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleRow.id));
      const bindings = keys.flatMap((key) => {
        const permission = permissionByKey.get(key);
        return permission ? [{ roleId: roleRow.id, permissionId: permission.id }] : [];
      });
      if (bindings.length > 0) await db.insert(rolePermissions).values(bindings).onConflictDoNothing();
    }

    // The sole seeded account. Members and content are created through the application.
    const [existingSuperadmin] = await db.select().from(users).where(eq(users.email, SUPERADMIN_EMAIL)).limit(1);
    let superadminId = existingSuperadmin?.id;
    if (!superadminId) {
      const passwordHash = await argon2.hash(SUPERADMIN_PASSWORD, { type: argon2.argon2id });
      const [superadmin] = await db.insert(users).values({
        email: SUPERADMIN_EMAIL,
        passwordHash,
        fullName: 'Super Admin',
        status: 'active',
      }).returning();
      superadminId = superadmin?.id;
    }

    if (superadminId) {
      await db.insert(profiles).values({ userId: superadminId }).onConflictDoNothing();
      const [superadminRole] = await db.select().from(roles).where(eq(roles.slug, 'super-admin')).limit(1);
      if (superadminRole) await db.insert(userRoles).values({ userId: superadminId, roleId: superadminRole.id }).onConflictDoNothing();
    }

    console.log(`Seed complete: authorization catalogs and ${SUPERADMIN_EMAIL}`);
  } finally {
    await pool.end();
  }
}

seed().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
