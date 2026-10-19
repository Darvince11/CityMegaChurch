import { Inject, Injectable } from "@nestjs/common";
import argon2 from "argon2";
import { eq } from "drizzle-orm";
import {
  ConflictError,
  UnauthenticatedError,
  type AuthUser,
  type LoginRequest,
  type ChangePasswordRequest,
  type RegisterRequest,
} from "@cdp/shared";
import type { Database } from "@cdp/database";
import {
  churchPositions,
  auditLogs,
  permissions,
  profiles,
  rolePermissions,
  roles,
  sessions,
  userRoles,
  users,
} from "@cdp/database";
import { DATABASE } from "../database/database.module";
import type { Env } from "../config/env";
import { randomToken, sha256 } from "./crypto.util";
import type { SessionTokenPair } from "./interfaces/request-with-user";

export const AUTH_SERVICE = "AUTH_SERVICE";

export interface AuthenticatedSession {
  user: AuthUser;
  pair: SessionTokenPair;
}

/**
 * Owns account lifecycle and opaque HTTP-only session tokens
 * (docs/ARCHITECTURE.md §auth-session-flow).
 */
@Injectable()
export class AuthService {
  constructor(
    @Inject(DATABASE) private readonly db: Database,
    @Inject("ENV") private readonly env: Env,
  ) {}

  async register(input: RegisterRequest): Promise<AuthenticatedSession> {
    const [existing] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, input.email))
      .limit(1);
    if (existing) {
      throw new ConflictError("An account with this email already exists.");
    }

    const passwordHash = await argon2.hash(input.password, {
      type: argon2.argon2id,
      memoryCost: this.env.PASSWORD_MEMORY_COST,
      timeCost: this.env.PASSWORD_TIME_COST,
      parallelism: this.env.PASSWORD_PARALLELISM,
    });

    const pair = this.createSessionTokenPair();
    const userId = await this.db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({
          email: input.email,
          passwordHash,
          fullName: input.fullName,
          phone: input.phone || null,
          status: "active",
        })
        .onConflictDoNothing({ target: users.email })
        .returning();
      if (!user) {
        throw new ConflictError("An account with this email already exists.");
      }

      const [memberPosition] = await tx
        .select()
        .from(churchPositions)
        .where(eq(churchPositions.name, "Member"))
        .limit(1);
      await tx.insert(profiles).values({
        userId: user.id,
        churchPositionId: memberPosition?.id ?? null,
      });

      const [memberRole] = await tx
        .select()
        .from(roles)
        .where(eq(roles.slug, "member"))
        .limit(1);
      if (memberRole) {
        await tx
          .insert(userRoles)
          .values({ userId: user.id, roleId: memberRole.id })
          .onConflictDoNothing();
      }

      await tx.insert(sessions).values({
        userId: user.id,
        tokenHash: pair.tokenHash,
        expiresAt: new Date(
          Date.now() + this.env.SESSION_TTL_HOURS * 60 * 60 * 1000,
        ),
      });
      return user.id;
    });
    return { user: await this.currentUser(userId), pair };
  }

  async login(input: LoginRequest): Promise<AuthenticatedSession> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, input.email))
      .limit(1);
    if (!user || user.status !== "active") {
      throw new UnauthenticatedError("Invalid email or password.");
    }

    const valid = await argon2.verify(user.passwordHash, input.password);
    if (!valid) {
      throw new UnauthenticatedError("Invalid email or password.");
    }
    if (argon2.needsRehash(user.passwordHash, { memoryCost: this.env.PASSWORD_MEMORY_COST, timeCost: this.env.PASSWORD_TIME_COST, parallelism: this.env.PASSWORD_PARALLELISM })) {
      const passwordHash = await argon2.hash(input.password, { type: argon2.argon2id, memoryCost: this.env.PASSWORD_MEMORY_COST, timeCost: this.env.PASSWORD_TIME_COST, parallelism: this.env.PASSWORD_PARALLELISM });
      await this.db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, user.id));
    }

    const pair = this.createSessionTokenPair();
    await this.insertSession(user.id, pair);
    const authUser = await this.currentUser(user.id);
    if (authUser.permissions.includes('reports.read_all')) {
      await this.db.insert(auditLogs).values({ userId: authUser.id, actorName: authUser.fullName, action: 'signed in', entityType: 'authentication', entityId: authUser.id, details: 'Administrator signed in to the portal' });
    }
    return { user: authUser, pair };
  }

  /** Revokes a session, given the raw cookie token. */
  async logout(token: string): Promise<void> {
    const [session] = await this.db
      .select()
      .from(sessions)
      .where(eq(sessions.tokenHash, sha256(token)))
      .limit(1);
    if (session && !session.revokedAt) {
      await this.db
        .update(sessions)
        .set({ revokedAt: new Date() })
        .where(eq(sessions.id, session.id));
    }
  }

  /** Fresh read of the active user (used by /auth/me). */
  async currentUser(userId: string): Promise<AuthUser> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (!user) {
      throw new UnauthenticatedError("Account no longer exists.");
    }
    if (user.status !== "active") {
      throw new UnauthenticatedError("This account is inactive.");
    }

    const roleRows = await this.db
      .select({ slug: roles.slug })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, userId));

    const permissionRows = await this.db
      .selectDistinct({ key: permissions.key })
      .from(userRoles)
      .innerJoin(rolePermissions, eq(userRoles.roleId, rolePermissions.roleId))
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(userRoles.userId, userId));

    const [profile] = await this.db
      .select({ position: churchPositions.name })
      .from(profiles)
      .leftJoin(
        churchPositions,
        eq(profiles.churchPositionId, churchPositions.id),
      )
      .where(eq(profiles.userId, userId))
      .limit(1);

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone ?? null,
      status: user.status === "active" ? "active" : "inactive",
      twoFactorEnabled: user.twoFactorEnabled,
      roles: roleRows.map((row: { slug: string }) => row.slug),
      permissions: permissionRows.map((row: { key: string }) => row.key),
      churchPosition: profile?.position ?? null,
    };
  }

  async changePassword(userId: string, input: ChangePasswordRequest): Promise<void> {
    const [user] = await this.db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user || !(await argon2.verify(user.passwordHash, input.currentPassword))) {
      throw new UnauthenticatedError('Your current password is incorrect.');
    }
    const passwordHash = await argon2.hash(input.newPassword, {
      type: argon2.argon2id,
      memoryCost: this.env.PASSWORD_MEMORY_COST,
      timeCost: this.env.PASSWORD_TIME_COST,
      parallelism: this.env.PASSWORD_PARALLELISM,
    });
    await this.db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, userId));
  }

  private createSessionTokenPair(): SessionTokenPair {
    const token = randomToken();
    return { token, tokenHash: sha256(token) };
  }

  private async insertSession(
    userId: string,
    pair: SessionTokenPair,
  ): Promise<void> {
    await this.db.insert(sessions).values({
      userId,
      tokenHash: pair.tokenHash,
      expiresAt: new Date(
        Date.now() + this.env.SESSION_TTL_HOURS * 60 * 60 * 1000,
      ),
    });
  }
}
