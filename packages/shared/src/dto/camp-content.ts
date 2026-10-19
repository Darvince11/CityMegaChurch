import { z } from 'zod';

const inlineText = (min: number, max: number) => z.string().trim().min(min).max(max).refine((value) => !/[\u0000-\u001F\u007F<>]/.test(value), 'Unsupported characters').transform((value) => value.normalize('NFKC').replace(/\s+/g, ' '));
const longText = (min: number, max: number) => z.string().trim().min(min).max(max).refine((value) => !/[\u0000\u0008\u000B\u000C\u000E-\u001F\u007F<>]/.test(value), 'Unsupported characters').transform((value) => value.normalize('NFKC'));
const safeWebUrl = z.string().url().refine((value) => { const protocol = new URL(value).protocol; return protocol === 'https:' || protocol === 'http:'; }, 'Only HTTP or HTTPS links are allowed');
export const UuidSchema = z.string().uuid('Invalid identifier');

export const CreateBookingSchema = z.object({
  campId: z.string().uuid(),
  bedId: z.string().uuid(),
  fullName: inlineText(2, 120),
  phone: z.string().trim().regex(/^\+?[0-9]{9,15}$/, 'Enter a valid phone number'),
  group: z.enum(['Group 1', 'Group 2', 'Group 3', 'Group 4', 'Group 5']),
  notes: longText(0, 500).optional(),
});
export type CreateBooking = z.infer<typeof CreateBookingSchema>;

export const ReviewBookingSchema = z.object({ status: z.enum(['approved', 'declined']) });
export type ReviewBooking = z.infer<typeof ReviewBookingSchema>;

export const AccommodationSchema = z.object({
  name: inlineText(2, 120),
  pricePesewas: z.number().int().min(0).max(100_000_000),
  capacity: z.number().int().min(1).max(10_000),
});
export type AccommodationInput = z.infer<typeof AccommodationSchema>;

export const AnnouncementSchema = z.object({
  title: inlineText(3, 160),
  body: longText(3, 12_000),
  kind: z.enum(['camp', 'service', 'general']).default('general'),
});
export type AnnouncementInput = z.infer<typeof AnnouncementSchema>;

export const ServiceUpdateSchema = z.object({
  title: inlineText(3, 160),
  pastor: inlineText(0, 120).optional(),
  sermonTitle: inlineText(0, 180).optional(),
  summary: longText(3, 12_000),
  imageUrl: safeWebUrl.optional(),
  serviceDate: z.string().datetime(),
});
export type ServiceUpdateInput = z.infer<typeof ServiceUpdateSchema>;

export const SermonSchema = z.object({
  title: inlineText(3, 180),
  speaker: inlineText(2, 120),
  summary: longText(3, 2_000),
  videoUrl: safeWebUrl.optional(),
  preachedAt: z.string().datetime(),
});
export type SermonInput = z.infer<typeof SermonSchema>;

export const GalleryPhotoSchema = z.object({ imageUrl: safeWebUrl, title: inlineText(2, 160), caption: longText(0, 500).optional() });
export type GalleryPhotoInput = z.infer<typeof GalleryPhotoSchema>;
