import { Body, Controller, Get, Inject, Post, Req, Res } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import {
  LoginRequestSchema,
  ChangePasswordSchema,
  RegisterRequestSchema,
  type AuthResponse,
  type LoginRequest,
  type ChangePasswordRequest,
  type RegisterRequest,
} from '@cdp/shared';
import { AUTH_SERVICE, AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import type { RequestWithUser } from './interfaces/request-with-user';
import type { Env } from '../config/env';

/**
 * Public endpoints return the raw token only inside the HttpOnly cookie;
 * the JSON body never carries the session token (docs/API.md §auth).
 */
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AUTH_SERVICE) private readonly authService: AuthService,
    @Inject('ENV') private readonly env: Env,
  ) {}

  @Public()
  @Post('register')
  async register(
    @Body() body: unknown,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<AuthResponse> {
    const input = RegisterRequestSchema.parse(body) as RegisterRequest;
    const { user, pair } = await this.authService.register(input);
    this.setSessionCookie(reply, pair.token);
    return { user };
  }

  @Public()
  @Post('login')
  async login(
    @Body() body: unknown,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<AuthResponse> {
    const input = LoginRequestSchema.parse(body) as LoginRequest;
    const { user, pair } = await this.authService.login(input);
    this.setSessionCookie(reply, pair.token);
    return { user };
  }

  @Post('logout')
  async logout(
    @Req() request: RequestWithUser,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<{ loggedOut: boolean }> {
    const token = request.cookies?.[this.env.COOKIE_NAME];
    if (token) {
      await this.authService.logout(token);
      reply.clearCookie(this.env.COOKIE_NAME, { path: '/' });
    }
    return { loggedOut: true };
  }

  @Get('me')
  async me(@CurrentUser() user: RequestWithUser['user']): Promise<AuthResponse> {
    const fresh = await this.authService.currentUser(user.id);
    return { user: fresh };
  }

  @Post('change-password')
  async changePassword(
    @CurrentUser() user: RequestWithUser['user'],
    @Body() body: unknown,
  ): Promise<{ changed: boolean }> {
    const input = ChangePasswordSchema.parse(body) as ChangePasswordRequest;
    await this.authService.changePassword(user.id, input);
    return { changed: true };
  }

  private setSessionCookie(reply: FastifyReply, token: string): void {
    reply.setCookie(this.env.COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: this.env.COOKIE_SECURE,
      path: '/',
      priority: 'high',
      maxAge: this.env.SESSION_TTL_HOURS * 60 * 60,
    });
  }
}
