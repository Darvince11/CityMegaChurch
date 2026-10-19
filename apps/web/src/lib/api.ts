import type { AccommodationInput, AnnouncementInput, ApiError, AuthResponse, ChangePasswordRequest, CreateBooking, LoginRequest, RegisterRequest, ReviewBooking, ServiceUpdateInput } from '@cdp/shared';
import { AuthResponseSchema } from '@cdp/shared';

/**
 * Thin fetch client for the NestJS API. All calls include credentials so the
 * HttpOnly session cookie rides along. In development the Next.js rewrite
 * proxies `/api/*` to the monolith; in production the browser targets the
 * public API origin directly.
 */
const API_BASE = '';

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
    public readonly details?: ApiError['details'],
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      ...(init?.body !== undefined ? { 'content-type': 'application/json' } : {}),
      ...init?.headers,
    },
  });

  const body = (await response.json().catch(() => null)) as
    | { error?: ApiError }
    | T
    | null;

  if (!response.ok) {
    const error = (body as { error?: ApiError } | null)?.error;
    throw new ApiClientError(
      error?.message ?? 'Request failed.',
      response.status,
      error?.code ?? `HTTP_${response.status}`,
      error?.details,
    );
  }

  return body as T;
}

export const api = {
  /** POST /api/v1/auth/register */
  async register(input: RegisterRequest): Promise<AuthResponse> {
    const response = await request<AuthResponse>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return AuthResponseSchema.parse(response);
  },

  /** POST /api/v1/auth/login */
  async login(input: LoginRequest): Promise<AuthResponse> {
    const response = await request<AuthResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return AuthResponseSchema.parse(response);
  },

  /** POST /api/v1/auth/logout */
  async logout(): Promise<void> {
    await request<{ loggedOut: boolean }>('/api/v1/auth/logout', { method: 'POST' });
  },

  /** GET /api/v1/auth/me */
  async me(): Promise<AuthResponse> {
    const response = await request<AuthResponse>('/api/v1/auth/me');
    return AuthResponseSchema.parse(response);
  },

  /** GET /api/v1/health */
  async health(): Promise<unknown> {
    return request('/api/v1/health');
  },

  async changePassword(input: ChangePasswordRequest): Promise<void> { await request('/api/v1/auth/change-password', { method: 'POST', body: JSON.stringify(input) }); },

  async memberOverview(): Promise<MemberOverview> { return request('/api/v1/member/overview'); },
  async bookBed(input: CreateBooking): Promise<unknown> { return request('/api/v1/member/camp-bookings', { method: 'POST', body: JSON.stringify(input) }); },
  async homeContent(): Promise<HomeContent> { return request('/api/v1/public/home-content'); },
  async announcements(): Promise<Announcement[]> { return request('/api/v1/public/announcements'); },
  async sermons(): Promise<Sermon[]> { return request('/api/v1/public/sermons'); },
  async gallery(): Promise<GalleryPhoto[]> { return request('/api/v1/public/gallery'); },
  async adminDashboard(): Promise<AdminDashboard> { return request('/api/v1/admin/dashboard'); },
  async adminBookings(): Promise<AdminBooking[]> { return request('/api/v1/admin/camp-bookings'); },
  async reviewBooking(id: string, input: ReviewBooking): Promise<unknown> { return request(`/api/v1/admin/camp-bookings/${id}`, { method: 'PATCH', body: JSON.stringify(input) }); },
  async updateAccommodation(id: string, input: AccommodationInput): Promise<unknown> { return request(`/api/v1/admin/accommodations/${id}`, { method: 'PATCH', body: JSON.stringify(input) }); },
  async resetCampBookings(id: string): Promise<unknown> { return request(`/api/v1/admin/camps/${id}/reset-bookings`, { method: 'POST' }); },
  async createAnnouncement(input: AnnouncementInput): Promise<unknown> { return request('/api/v1/admin/announcements', { method: 'POST', body: JSON.stringify(input) }); },
  async updateAnnouncement(id: string, input: AnnouncementInput): Promise<unknown> { return request(`/api/v1/admin/announcements/${id}`, { method: 'PATCH', body: JSON.stringify(input) }); },
  async deleteAnnouncement(id: string): Promise<unknown> { return request(`/api/v1/admin/announcements/${id}`, { method: 'DELETE' }); },
  async createServiceUpdate(input: ServiceUpdateInput): Promise<unknown> { return request('/api/v1/admin/service-updates', { method: 'POST', body: JSON.stringify(input) }); },
  async updateServiceUpdate(id: string, input: ServiceUpdateInput): Promise<unknown> { return request(`/api/v1/admin/service-updates/${id}`, { method: 'PATCH', body: JSON.stringify(input) }); },
  async deleteServiceUpdate(id: string): Promise<unknown> { return request(`/api/v1/admin/service-updates/${id}`, { method: 'DELETE' }); },
  async createSermon(input: SermonInput): Promise<unknown> { return request('/api/v1/admin/sermons', { method: 'POST', body: JSON.stringify(input) }); },
  async updateSermon(id: string, input: SermonInput): Promise<unknown> { return request(`/api/v1/admin/sermons/${id}`, { method: 'PATCH', body: JSON.stringify(input) }); },
  async deleteSermon(id: string): Promise<unknown> { return request(`/api/v1/admin/sermons/${id}`, { method: 'DELETE' }); },
  async createGalleryPhoto(input: GalleryPhotoInput): Promise<unknown> { return request('/api/v1/admin/gallery', { method: 'POST', body: JSON.stringify(input) }); },
  async deleteGalleryPhoto(id: string): Promise<unknown> { return request(`/api/v1/admin/gallery/${id}`, { method: 'DELETE' }); },
};

export type CampBed = { id: string; label: string; room: string; capacity: number; bookedCount: number; pricePesewas: number };
export type Camp = { id: string; title: string; startsAt: string; endsAt: string; location: string; description: string; beds: CampBed[] };
export type MemberOverview = { booking: { id: string; status: string; campTitle: string; startsAt: string; location: string; bedLabel: string; room: string; pricePesewas: number } | null; camps: Camp[] };
export type Announcement = { id: string; title: string; body: string; kind: string; publishedAt: string };
export type ServiceUpdate = { id: string; title: string; pastor: string | null; sermonTitle: string | null; summary: string; imageUrl: string | null; serviceDate: string };
export type HomeContent = { announcements: Announcement[]; serviceUpdates: ServiceUpdate[]; camps: Camp[] };
export type AdminBooking = { id: string; status: string; notes: string | null; createdAt: string; memberName: string; memberEmail: string; memberPhone: string; memberGroup: string; campTitle: string; bedLabel: string; room: string };
export type AuditLog = { id: string; actorName: string; action: string; entityType: string; details: string; createdAt: string };
export type AdminDashboard = { metrics: { members: number; bookings: number; pending: number; approved: number }; recentBookings: AdminBooking[]; camps: Camp[]; announcements: Announcement[]; serviceUpdates: ServiceUpdate[]; sermons: Sermon[]; galleryPhotos: GalleryPhoto[]; auditLogs: AuditLog[] };
export type Sermon = { id: string; title: string; speaker: string; summary: string; videoUrl: string | null; preachedAt: string };
export type SermonInput = { title: string; speaker: string; summary: string; videoUrl?: string; preachedAt: string };
export type GalleryPhoto = { id: string; imageUrl: string; title: string; caption: string | null; createdAt: string };
export type GalleryPhotoInput = { imageUrl: string; title: string; caption?: string };
