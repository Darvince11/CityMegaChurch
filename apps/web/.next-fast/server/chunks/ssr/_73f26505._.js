module.exports = [
"[project]/packages/shared/dist/dto/auth.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ApiErrorSchema = exports.AuthResponseSchema = exports.AuthUserSchema = exports.LoginRequestSchema = exports.RegisterRequestSchema = exports.phoneSchema = exports.fullNameSchema = exports.passwordSchema = exports.emailSchema = void 0;
const zod_1 = __turbopack_context__.r("[project]/node_modules/.pnpm/zod@3.25.76/node_modules/zod/index.cjs [app-ssr] (ecmascript)");
/**
 * Canonical DTOs shared by the API (validation) and the web (types).
 * The API imports these directly; the web may import types via `import type`.
 */ // ---------------------------------------------------------------- auth
exports.emailSchema = zod_1.z.string().trim().toLowerCase().email('Invalid email address').max(254, 'Email is too long');
exports.passwordSchema = zod_1.z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password is too long');
exports.fullNameSchema = zod_1.z.string().trim().min(1, 'Full name is required').max(120, 'Full name is too long');
exports.phoneSchema = zod_1.z.string().trim().regex(/^\+?[0-9]{9,15}$/, 'Invalid phone number — use digits, optional leading +').optional().or(zod_1.z.literal(''));
exports.RegisterRequestSchema = zod_1.z.object({
    email: exports.emailSchema,
    password: exports.passwordSchema,
    fullName: exports.fullNameSchema,
    phone: exports.phoneSchema
});
exports.LoginRequestSchema = zod_1.z.object({
    email: exports.emailSchema,
    password: zod_1.z.string().min(1, 'Password is required').max(128)
});
exports.AuthUserSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    email: zod_1.z.string().email(),
    fullName: zod_1.z.string(),
    phone: zod_1.z.string().nullable(),
    status: zod_1.z.enum([
        'active',
        'inactive'
    ]),
    twoFactorEnabled: zod_1.z.boolean(),
    roles: zod_1.z.array(zod_1.z.string()),
    permissions: zod_1.z.array(zod_1.z.string()),
    churchPosition: zod_1.z.string().nullable()
});
exports.AuthResponseSchema = zod_1.z.object({
    user: exports.AuthUserSchema
});
// ------------------------------------------------------------ envelope
exports.ApiErrorSchema = zod_1.z.object({
    code: zod_1.z.string(),
    message: zod_1.z.string(),
    details: zod_1.z.array(zod_1.z.object({
        field: zod_1.z.string(),
        message: zod_1.z.string()
    })).optional()
}); //# sourceMappingURL=auth.js.map
}),
"[project]/packages/shared/dist/dto/camp-content.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.GalleryPhotoSchema = exports.SermonSchema = exports.ServiceUpdateSchema = exports.AnnouncementSchema = exports.ReviewBookingSchema = exports.CreateBookingSchema = void 0;
const zod_1 = __turbopack_context__.r("[project]/node_modules/.pnpm/zod@3.25.76/node_modules/zod/index.cjs [app-ssr] (ecmascript)");
exports.CreateBookingSchema = zod_1.z.object({
    campId: zod_1.z.string().uuid(),
    bedId: zod_1.z.string().uuid(),
    notes: zod_1.z.string().trim().max(500).optional()
});
exports.ReviewBookingSchema = zod_1.z.object({
    status: zod_1.z.enum([
        'approved',
        'declined'
    ])
});
exports.AnnouncementSchema = zod_1.z.object({
    title: zod_1.z.string().trim().min(3).max(160),
    body: zod_1.z.string().trim().min(3).max(12_000),
    kind: zod_1.z.enum([
        'camp',
        'service',
        'general'
    ]).default('general')
});
exports.ServiceUpdateSchema = zod_1.z.object({
    title: zod_1.z.string().trim().min(3).max(160),
    pastor: zod_1.z.string().trim().max(120).optional(),
    sermonTitle: zod_1.z.string().trim().max(180).optional(),
    summary: zod_1.z.string().trim().min(3).max(12_000),
    imageUrl: zod_1.z.string().url().optional(),
    serviceDate: zod_1.z.string().datetime()
});
exports.SermonSchema = zod_1.z.object({
    title: zod_1.z.string().trim().min(3).max(180),
    speaker: zod_1.z.string().trim().min(2).max(120),
    summary: zod_1.z.string().trim().min(3).max(2_000),
    videoUrl: zod_1.z.string().url().optional(),
    preachedAt: zod_1.z.string().datetime()
});
exports.GalleryPhotoSchema = zod_1.z.object({
    imageUrl: zod_1.z.string().url(),
    title: zod_1.z.string().trim().min(2).max(160),
    caption: zod_1.z.string().trim().max(500).optional()
}); //# sourceMappingURL=camp-content.js.map
}),
"[project]/packages/shared/dist/errors/domain-error.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.NotFoundError = exports.ForbiddenError = exports.UnauthenticatedError = exports.ConflictError = exports.ValidationError = exports.DomainError = void 0;
/**
 * Domain errors thrown by services and mapped to HTTP by the API's
 * centralized exception filter. Status defaults to 400; domain code
 * determines the machine-readable `error.code` in responses.
 */ class DomainError extends Error {
    code;
    status;
    constructor(message, code = 'DOMAIN_ERROR', status = 400){
        super(message);
        this.code = code;
        this.status = status;
        this.name = 'DomainError';
    }
}
exports.DomainError = DomainError;
/** Failed request validation (Zod). */ class ValidationError extends DomainError {
    details;
    constructor(message, details = []){
        super(message, 'VALIDATION_FAILED', 400);
        this.details = details;
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
/** Resource exists or a uniqueness constraint would be violated. */ class ConflictError extends DomainError {
    constructor(message){
        super(message, 'CONFLICT', 409);
        this.name = 'ConflictError';
    }
}
exports.ConflictError = ConflictError;
/** Authenticated identity missing/expired. */ class UnauthenticatedError extends DomainError {
    constructor(message = 'You must be signed in.'){
        super(message, 'UNAUTHENTICATED', 401);
        this.name = 'UnauthenticatedError';
    }
}
exports.UnauthenticatedError = UnauthenticatedError;
/** Authenticated but lacking permission. */ class ForbiddenError extends DomainError {
    constructor(message = 'You do not have permission to do that.'){
        super(message, 'FORBIDDEN', 403);
        this.name = 'ForbiddenError';
    }
}
exports.ForbiddenError = ForbiddenError;
/** Resource not found. Never leaks existence of sensitive resources. */ class NotFoundError extends DomainError {
    constructor(message = 'Resource not found.'){
        super(message, 'NOT_FOUND', 404);
        this.name = 'NotFoundError';
    }
}
exports.NotFoundError = NotFoundError; //# sourceMappingURL=domain-error.js.map
}),
"[project]/packages/shared/dist/index.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __createBinding = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = {
            enumerable: true,
            get: function() {
                return m[k];
            }
        };
    }
    Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});
var __exportStar = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__exportStar || function(m, exports1) {
    for(var p in m)if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports1, p)) __createBinding(exports1, m, p);
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ZodError = void 0;
__exportStar(__turbopack_context__.r("[project]/packages/shared/dist/dto/auth.js [app-ssr] (ecmascript)"), exports);
__exportStar(__turbopack_context__.r("[project]/packages/shared/dist/dto/camp-content.js [app-ssr] (ecmascript)"), exports);
__exportStar(__turbopack_context__.r("[project]/packages/shared/dist/errors/domain-error.js [app-ssr] (ecmascript)"), exports);
// Export the same validator error class used by the shared schemas, including
// when a consumer loads this package through CommonJS from an ES module.
var zod_1 = __turbopack_context__.r("[project]/node_modules/.pnpm/zod@3.25.76/node_modules/zod/index.cjs [app-ssr] (ecmascript)");
Object.defineProperty(exports, "ZodError", {
    enumerable: true,
    get: function() {
        return zod_1.ZodError;
    }
}); //# sourceMappingURL=index.js.map
}),
"[project]/apps/web/src/lib/api.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ApiClientError",
    ()=>ApiClientError,
    "api",
    ()=>api
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/shared/dist/index.js [app-ssr] (ecmascript)");
;
/**
 * Thin fetch client for the NestJS API. All calls include credentials so the
 * HttpOnly session cookie rides along. In development the Next.js rewrite
 * proxies `/api/*` to the monolith; in production the browser targets the
 * public API origin directly.
 */ const API_BASE = '';
class ApiClientError extends Error {
    status;
    code;
    details;
    constructor(message, status, code, details){
        super(message), this.status = status, this.code = code, this.details = details;
        this.name = 'ApiClientError';
    }
}
async function request(path, init) {
    const response = await fetch(`${API_BASE}${path}`, {
        ...init,
        credentials: 'include',
        headers: {
            ...init?.body !== undefined ? {
                'content-type': 'application/json'
            } : {},
            ...init?.headers
        }
    });
    const body = await response.json().catch(()=>null);
    if (!response.ok) {
        const error = body?.error;
        throw new ApiClientError(error?.message ?? 'Request failed.', response.status, error?.code ?? `HTTP_${response.status}`, error?.details);
    }
    return body;
}
const api = {
    /** POST /api/v1/auth/register */ async register (input) {
        const response = await request('/api/v1/auth/register', {
            method: 'POST',
            body: JSON.stringify(input)
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AuthResponseSchema"].parse(response);
    },
    /** POST /api/v1/auth/login */ async login (input) {
        const response = await request('/api/v1/auth/login', {
            method: 'POST',
            body: JSON.stringify(input)
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AuthResponseSchema"].parse(response);
    },
    /** POST /api/v1/auth/logout */ async logout () {
        await request('/api/v1/auth/logout', {
            method: 'POST'
        });
    },
    /** GET /api/v1/auth/me */ async me () {
        const response = await request('/api/v1/auth/me');
        return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$shared$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AuthResponseSchema"].parse(response);
    },
    /** GET /api/v1/health */ async health () {
        return request('/api/v1/health');
    },
    async memberOverview () {
        return request('/api/v1/member/overview');
    },
    async bookBed (input) {
        return request('/api/v1/member/camp-bookings', {
            method: 'POST',
            body: JSON.stringify(input)
        });
    },
    async homeContent () {
        return request('/api/v1/public/home-content');
    },
    async announcements () {
        return request('/api/v1/public/announcements');
    },
    async sermons () {
        return request('/api/v1/public/sermons');
    },
    async gallery () {
        return request('/api/v1/public/gallery');
    },
    async adminDashboard () {
        return request('/api/v1/admin/dashboard');
    },
    async adminBookings () {
        return request('/api/v1/admin/camp-bookings');
    },
    async reviewBooking (id, input) {
        return request(`/api/v1/admin/camp-bookings/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(input)
        });
    },
    async createAnnouncement (input) {
        return request('/api/v1/admin/announcements', {
            method: 'POST',
            body: JSON.stringify(input)
        });
    },
    async updateAnnouncement (id, input) {
        return request(`/api/v1/admin/announcements/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(input)
        });
    },
    async deleteAnnouncement (id) {
        return request(`/api/v1/admin/announcements/${id}`, {
            method: 'DELETE'
        });
    },
    async createServiceUpdate (input) {
        return request('/api/v1/admin/service-updates', {
            method: 'POST',
            body: JSON.stringify(input)
        });
    },
    async updateServiceUpdate (id, input) {
        return request(`/api/v1/admin/service-updates/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(input)
        });
    },
    async deleteServiceUpdate (id) {
        return request(`/api/v1/admin/service-updates/${id}`, {
            method: 'DELETE'
        });
    },
    async createSermon (input) {
        return request('/api/v1/admin/sermons', {
            method: 'POST',
            body: JSON.stringify(input)
        });
    },
    async updateSermon (id, input) {
        return request(`/api/v1/admin/sermons/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(input)
        });
    },
    async deleteSermon (id) {
        return request(`/api/v1/admin/sermons/${id}`, {
            method: 'DELETE'
        });
    },
    async createGalleryPhoto (input) {
        return request('/api/v1/admin/gallery', {
            method: 'POST',
            body: JSON.stringify(input)
        });
    },
    async deleteGalleryPhoto (id) {
        return request(`/api/v1/admin/gallery/${id}`, {
            method: 'DELETE'
        });
    }
};
}),
"[project]/apps/web/src/app/(public)/admin/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AdminPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.5.25_@types+node@22.20.2_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.5.25_@types+node@22.20.2_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.5.25_@types+node@22.20.2_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/api.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$brand$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/brand.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$icon$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/icon.tsx [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
const empty = {
    metrics: {
        members: 0,
        bookings: 0,
        pending: 0,
        approved: 0
    },
    recentBookings: [],
    announcements: [],
    serviceUpdates: [],
    sermons: [],
    galleryPhotos: [],
    auditLogs: []
};
const menu = [
    {
        id: 'overview',
        label: 'Overview',
        icon: 'cross'
    },
    {
        id: 'bookings',
        label: 'Camp bookings',
        icon: 'people'
    },
    {
        id: 'announcements',
        label: 'Announcements',
        icon: 'clock'
    },
    {
        id: 'sermons',
        label: 'Sermons',
        icon: 'book'
    },
    {
        id: 'services',
        label: 'Service updates',
        icon: 'sun'
    },
    {
        id: 'audit',
        label: 'Audit trail',
        icon: 'clock'
    },
    {
        id: 'gallery',
        label: 'Gallery',
        icon: 'heart'
    }
];
function AdminPage() {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const [view, setView] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('overview');
    const [data, setData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [notice, setNotice] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [busy, setBusy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [editingAnnouncement, setEditingAnnouncement] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [editingSermon, setEditingSermon] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [editingService, setEditingService] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    async function load() {
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["api"].me();
            setData(await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["api"].adminDashboard());
            setError(null);
        } catch (err) {
            if (err instanceof __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ApiClientError"] && err.status === 401) router.replace('/login');
            else if (err instanceof __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ApiClientError"] && err.status === 403) setError('Your account does not have administration access.');
            else {
                setData(empty);
                setError('Live data is unavailable. Restart the API preview, then refresh this page.');
            }
        }
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        void load();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    async function action(key, work, message) {
        setBusy(key);
        setError(null);
        try {
            await work();
            setNotice(message);
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'The action could not be completed.');
        } finally{
            setBusy(null);
        }
    }
    async function review(id, status) {
        await action(id, ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["api"].reviewBooking(id, {
                status
            }), `Booking ${status}.`);
    }
    async function saveAnnouncement(event) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const input = {
            title: String(form.get('title')),
            body: String(form.get('body')),
            kind: String(form.get('kind'))
        };
        await action('announcement', ()=>editingAnnouncement ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["api"].updateAnnouncement(editingAnnouncement.id, input) : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["api"].createAnnouncement(input), editingAnnouncement ? 'Announcement updated.' : 'Announcement published.');
        setEditingAnnouncement(null);
        event.currentTarget.reset();
    }
    async function saveSermon(event) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const input = {
            title: String(form.get('title')),
            speaker: String(form.get('speaker')),
            summary: String(form.get('summary')),
            videoUrl: String(form.get('videoUrl')) || undefined,
            preachedAt: new Date(String(form.get('preachedAt'))).toISOString()
        };
        await action('sermon', ()=>editingSermon ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["api"].updateSermon(editingSermon.id, input) : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["api"].createSermon(input), editingSermon ? 'Sermon updated.' : 'Sermon published.');
        setEditingSermon(null);
        event.currentTarget.reset();
    }
    async function saveService(event) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const input = {
            title: String(form.get('title')),
            pastor: String(form.get('pastor')) || undefined,
            sermonTitle: String(form.get('sermonTitle')) || undefined,
            summary: String(form.get('summary')),
            imageUrl: String(form.get('imageUrl')) || undefined,
            serviceDate: new Date(String(form.get('serviceDate'))).toISOString()
        };
        await action('service', ()=>editingService ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["api"].updateServiceUpdate(editingService.id, input) : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["api"].createServiceUpdate(input), editingService ? 'Service update edited.' : 'Service update published.');
        setEditingService(null);
        event.currentTarget.reset();
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "portal-shell",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                className: "portal-sidebar",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$brand$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Brand"], {
                        variant: "light"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                        lineNumber: 29,
                        columnNumber: 74
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "portal-label",
                        children: "ADMIN PORTAL"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                        lineNumber: 29,
                        columnNumber: 98
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                        children: menu.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: view === item.id ? 'active' : '',
                                onClick: ()=>setView(item.id),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$icon$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Icon"], {
                                        name: item.icon
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                                        lineNumber: 29,
                                        columnNumber: 265
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: item.label
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                                        lineNumber: 29,
                                        columnNumber: 289
                                    }, this)
                                ]
                            }, item.id, true, {
                                fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                                lineNumber: 29,
                                columnNumber: 165
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                        lineNumber: 29,
                        columnNumber: 142
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "portal-exit",
                        onClick: ()=>router.push('/account'),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$icon$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Icon"], {
                                name: "arrow"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                                lineNumber: 29,
                                columnNumber: 403
                            }, this),
                            " Member space"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                        lineNumber: 29,
                        columnNumber: 331
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                lineNumber: 29,
                columnNumber: 40
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "portal-main",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                        className: "portal-topbar",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "eyebrow",
                                        children: "CITY MEGA CHURCH ADMINISTRATION"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                                        lineNumber: 29,
                                        columnNumber: 522
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        children: menu.find((item)=>item.id === view)?.label
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                                        lineNumber: 29,
                                        columnNumber: 580
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                                lineNumber: 29,
                                columnNumber: 517
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "portal-avatar",
                                children: "SA"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                                lineNumber: 29,
                                columnNumber: 639
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                        lineNumber: 29,
                        columnNumber: 483
                    }, this),
                    error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "alert",
                        children: error
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                        lineNumber: 29,
                        columnNumber: 697
                    }, this),
                    notice && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "success-message",
                        children: notice
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                        lineNumber: 29,
                        columnNumber: 741
                    }, this),
                    !data ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: "Loading portal…"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                        lineNumber: 29,
                        columnNumber: 794
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(PortalView, {
                        view: view,
                        data: data,
                        busy: busy,
                        review: review,
                        saveAnnouncement: saveAnnouncement,
                        saveSermon: saveSermon,
                        saveService: saveService,
                        editingAnnouncement: editingAnnouncement,
                        editingSermon: editingSermon,
                        editingService: editingService,
                        setEditingAnnouncement: setEditingAnnouncement,
                        setEditingSermon: setEditingSermon,
                        setEditingService: setEditingService,
                        run: action
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                        lineNumber: 29,
                        columnNumber: 819
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                lineNumber: 29,
                columnNumber: 453
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
        lineNumber: 29,
        columnNumber: 10
    }, this);
}
function PortalView(p) {
    if (p.view === 'gallery') return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(GalleryManager, {
        data: p.data,
        run: p.run
    }, void 0, false, {
        fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
        lineNumber: 34,
        columnNumber: 32
    }, this);
    const m = p.data.metrics;
    if (p.view === 'overview') return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "portal-metrics",
                children: [
                    [
                        'Members',
                        m.members
                    ],
                    [
                        'Camp requests',
                        m.bookings
                    ],
                    [
                        'Awaiting approval',
                        m.pending
                    ],
                    [
                        'Confirmed',
                        m.approved
                    ]
                ].map(([label, value])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: label
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                                lineNumber: 35,
                                columnNumber: 251
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: value
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                                lineNumber: 35,
                                columnNumber: 271
                            }, this)
                        ]
                    }, String(label), true, {
                        fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                        lineNumber: 35,
                        columnNumber: 222
                    }, this))
            }, void 0, false, {
                fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                lineNumber: 35,
                columnNumber: 58
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "portal-card",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "eyebrow",
                        children: "ACTIVITY SNAPSHOT"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                        lineNumber: 35,
                        columnNumber: 346
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        children: "Booking progress"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                        lineNumber: 35,
                        columnNumber: 390
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "portal-bars",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Pending"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                                        lineNumber: 35,
                                        columnNumber: 449
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                                        style: {
                                            width: `${Math.max(4, m.pending / Math.max(1, m.bookings) * 100)}%`
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                                        lineNumber: 35,
                                        columnNumber: 469
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                                lineNumber: 35,
                                columnNumber: 444
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Approved"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                                        lineNumber: 35,
                                        columnNumber: 555
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                                        style: {
                                            width: `${Math.max(4, m.approved / Math.max(1, m.bookings) * 100)}%`
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                                        lineNumber: 35,
                                        columnNumber: 576
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                                lineNumber: 35,
                                columnNumber: 550
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                        lineNumber: 35,
                        columnNumber: 415
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                lineNumber: 35,
                columnNumber: 313
            }, this)
        ]
    }, void 0, true);
    if (p.view === 'bookings') return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "portal-card",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionTitle, {
                title: "Camp bed requests",
                text: "Review every member request and confirm or decline their bed."
            }, void 0, false, {
                fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                lineNumber: 36,
                columnNumber: 66
            }, this),
            p.data.recentBookings.length ? p.data.recentBookings.map((b)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "manage-row",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                    children: b.memberName
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                                    lineNumber: 36,
                                    columnNumber: 279
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: b.memberEmail
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                                    lineNumber: 36,
                                    columnNumber: 310
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                            lineNumber: 36,
                            columnNumber: 274
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                    children: [
                                        b.room,
                                        " · ",
                                        b.bedLabel
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                                    lineNumber: 36,
                                    columnNumber: 349
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: b.campTitle
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                                    lineNumber: 36,
                                    columnNumber: 389
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                            lineNumber: 36,
                            columnNumber: 344
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: `status status--${b.status}`,
                            children: b.status
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                            lineNumber: 36,
                            columnNumber: 421
                        }, this),
                        b.status === 'pending' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "manage-actions",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>void p.review(b.id, 'approved'),
                                    children: "Approve"
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                                    lineNumber: 36,
                                    columnNumber: 540
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: "danger",
                                    onClick: ()=>void p.review(b.id, 'declined'),
                                    children: "Decline"
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                                    lineNumber: 36,
                                    columnNumber: 609
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                            lineNumber: 36,
                            columnNumber: 508
                        }, this)
                    ]
                }, b.id, true, {
                    fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                    lineNumber: 36,
                    columnNumber: 235
                }, this)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Empty, {
                text: "No camp bookings have been submitted."
            }, void 0, false, {
                fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                lineNumber: 36,
                columnNumber: 712
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
        lineNumber: 36,
        columnNumber: 33
    }, this);
    if (p.view === 'announcements') return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ManageLayout, {
        form: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
            className: "portal-form",
            onSubmit: p.saveAnnouncement,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionTitle, {
                    title: p.editingAnnouncement ? 'Edit announcement' : 'New announcement',
                    text: "Published announcements appear on the public Announcements page."
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                    lineNumber: 37,
                    columnNumber: 118
                }, void 0),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                    name: "title",
                    required: true,
                    defaultValue: p.editingAnnouncement?.title,
                    placeholder: "Announcement title"
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                    lineNumber: 37,
                    columnNumber: 274
                }, void 0),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                    name: "kind",
                    defaultValue: p.editingAnnouncement?.kind || 'general',
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                            value: "general",
                            children: "General"
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                            lineNumber: 37,
                            columnNumber: 455
                        }, void 0),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                            value: "camp",
                            children: "Camp"
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                            lineNumber: 37,
                            columnNumber: 495
                        }, void 0),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                            value: "service",
                            children: "Service"
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                            lineNumber: 37,
                            columnNumber: 529
                        }, void 0)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                    lineNumber: 37,
                    columnNumber: 381
                }, void 0),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                    name: "body",
                    required: true,
                    defaultValue: p.editingAnnouncement?.body,
                    placeholder: "Announcement details"
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                    lineNumber: 37,
                    columnNumber: 578
                }, void 0),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    className: "btn btn--primary",
                    disabled: p.busy === 'announcement',
                    children: p.editingAnnouncement ? 'Save changes' : 'Publish announcement'
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                    lineNumber: 37,
                    columnNumber: 688
                }, void 0),
                p.editingAnnouncement && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    type: "button",
                    className: "portal-cancel",
                    onClick: ()=>p.setEditingAnnouncement(null),
                    children: "Cancel editing"
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                    lineNumber: 37,
                    columnNumber: 854
                }, void 0)
            ]
        }, void 0, true, {
            fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
            lineNumber: 37,
            columnNumber: 58
        }, void 0),
        title: "Published announcements",
        items: p.data.announcements.map((a)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ContentRow, {
                title: a.title,
                meta: `${a.kind} · ${new Date(a.publishedAt).toLocaleDateString()}`,
                onEdit: ()=>p.setEditingAnnouncement(a),
                onDelete: ()=>void p.run(a.id, ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["api"].deleteAnnouncement(a.id), 'Announcement deleted.')
            }, a.id, false, {
                fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                lineNumber: 37,
                columnNumber: 1047
            }, void 0))
    }, void 0, false, {
        fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
        lineNumber: 37,
        columnNumber: 38
    }, this);
    if (p.view === 'sermons') return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ManageLayout, {
        form: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
            className: "portal-form",
            onSubmit: p.saveSermon,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionTitle, {
                    title: p.editingSermon ? 'Edit sermon' : 'Add sermon',
                    text: "This publishes directly to the public Sermons page."
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                    lineNumber: 38,
                    columnNumber: 106
                }, void 0),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                    name: "title",
                    required: true,
                    defaultValue: p.editingSermon?.title,
                    placeholder: "Sermon title"
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                    lineNumber: 38,
                    columnNumber: 231
                }, void 0),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                    name: "speaker",
                    required: true,
                    defaultValue: p.editingSermon?.speaker,
                    placeholder: "Pastor or speaker"
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                    lineNumber: 38,
                    columnNumber: 326
                }, void 0),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                    name: "preachedAt",
                    required: true,
                    type: "date",
                    defaultValue: p.editingSermon?.preachedAt.slice(0, 10)
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                    lineNumber: 38,
                    columnNumber: 430
                }, void 0),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                    name: "videoUrl",
                    type: "url",
                    defaultValue: p.editingSermon?.videoUrl || '',
                    placeholder: "Video link (optional)"
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                    lineNumber: 38,
                    columnNumber: 532
                }, void 0),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                    name: "summary",
                    required: true,
                    defaultValue: p.editingSermon?.summary,
                    placeholder: "Message summary"
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                    lineNumber: 38,
                    columnNumber: 648
                }, void 0),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    className: "btn btn--primary",
                    children: p.editingSermon ? 'Save changes' : 'Publish sermon'
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                    lineNumber: 38,
                    columnNumber: 753
                }, void 0)
            ]
        }, void 0, true, {
            fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
            lineNumber: 38,
            columnNumber: 52
        }, void 0),
        title: "Sermon library",
        items: p.data.sermons.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ContentRow, {
                title: s.title,
                meta: `${s.speaker} · ${new Date(s.preachedAt).toLocaleDateString()}`,
                onEdit: ()=>p.setEditingSermon(s),
                onDelete: ()=>void p.run(s.id, ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["api"].deleteSermon(s.id), 'Sermon deleted.')
            }, s.id, false, {
                fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                lineNumber: 38,
                columnNumber: 909
            }, void 0))
    }, void 0, false, {
        fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
        lineNumber: 38,
        columnNumber: 32
    }, this);
    if (p.view === 'services') return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ManageLayout, {
        form: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
            className: "portal-form",
            onSubmit: p.saveService,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionTitle, {
                    title: p.editingService ? 'Edit service post' : 'Add service update',
                    text: "Share last Sunday’s highlights on the home page."
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                    lineNumber: 39,
                    columnNumber: 108
                }, void 0),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                    name: "title",
                    required: true,
                    defaultValue: p.editingService?.title,
                    placeholder: "Post title"
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                    lineNumber: 39,
                    columnNumber: 245
                }, void 0),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                    name: "pastor",
                    defaultValue: p.editingService?.pastor || '',
                    placeholder: "Pastor or speaker"
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                    lineNumber: 39,
                    columnNumber: 339
                }, void 0),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                    name: "sermonTitle",
                    defaultValue: p.editingService?.sermonTitle || '',
                    placeholder: "Sermon title"
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                    lineNumber: 39,
                    columnNumber: 437
                }, void 0),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                    name: "serviceDate",
                    required: true,
                    type: "date",
                    defaultValue: p.editingService?.serviceDate.slice(0, 10)
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                    lineNumber: 39,
                    columnNumber: 540
                }, void 0),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                    name: "imageUrl",
                    type: "url",
                    defaultValue: p.editingService?.imageUrl || '',
                    placeholder: "Photo URL"
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                    lineNumber: 39,
                    columnNumber: 645
                }, void 0),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                    name: "summary",
                    required: true,
                    defaultValue: p.editingService?.summary,
                    placeholder: "Service recap"
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                    lineNumber: 39,
                    columnNumber: 750
                }, void 0),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    className: "btn btn--primary",
                    children: p.editingService ? 'Save changes' : 'Publish update'
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                    lineNumber: 39,
                    columnNumber: 854
                }, void 0)
            ]
        }, void 0, true, {
            fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
            lineNumber: 39,
            columnNumber: 53
        }, void 0),
        title: "Past service posts",
        items: p.data.serviceUpdates.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ContentRow, {
                title: s.title,
                meta: `${s.pastor || 'City Mega Church'} · ${new Date(s.serviceDate).toLocaleDateString()}`,
                onEdit: ()=>p.setEditingService(s),
                onDelete: ()=>void p.run(s.id, ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["api"].deleteServiceUpdate(s.id), 'Service update deleted.')
            }, s.id, false, {
                fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                lineNumber: 39,
                columnNumber: 1022
            }, void 0))
    }, void 0, false, {
        fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
        lineNumber: 39,
        columnNumber: 33
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "portal-card",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionTitle, {
                title: "Administrator audit trail",
                text: "A permanent record of administrator sign-ins and content changes."
            }, void 0, false, {
                fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                lineNumber: 40,
                columnNumber: 43
            }, this),
            p.data.auditLogs.length ? p.data.auditLogs.map((log)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "audit-row",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "audit-dot"
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                            lineNumber: 40,
                            columnNumber: 256
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                    children: [
                                        log.actorName,
                                        " ",
                                        log.action,
                                        " ",
                                        log.entityType
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                                    lineNumber: 40,
                                    columnNumber: 290
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    children: log.details
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                                    lineNumber: 40,
                                    columnNumber: 352
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                            lineNumber: 40,
                            columnNumber: 285
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("time", {
                            children: new Date(log.createdAt).toLocaleString()
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                            lineNumber: 40,
                            columnNumber: 378
                        }, this)
                    ]
                }, log.id, true, {
                    fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                    lineNumber: 40,
                    columnNumber: 216
                }, this)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Empty, {
                text: "No administrator activity has been recorded yet."
            }, void 0, false, {
                fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                lineNumber: 40,
                columnNumber: 441
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
        lineNumber: 40,
        columnNumber: 10
    }, this);
}
function SectionTitle({ title, text }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "portal-section-title",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                children: title
            }, void 0, false, {
                fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                lineNumber: 42,
                columnNumber: 109
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                children: text
            }, void 0, false, {
                fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                lineNumber: 42,
                columnNumber: 125
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
        lineNumber: 42,
        columnNumber: 71
    }, this);
}
function Empty({ text }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
        className: "portal-empty",
        children: text
    }, void 0, false, {
        fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
        lineNumber: 43,
        columnNumber: 45
    }, this);
}
function ManageLayout({ form, title, items }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "manage-grid",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "portal-card",
                children: form
            }, void 0, false, {
                fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                lineNumber: 44,
                columnNumber: 139
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "portal-card",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionTitle, {
                        title: title,
                        text: "Review, edit, or remove anything published in the past."
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                        lineNumber: 44,
                        columnNumber: 221
                    }, this),
                    items.length ? items : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Empty, {
                        text: "Nothing has been published yet."
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                        lineNumber: 44,
                        columnNumber: 333
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                lineNumber: 44,
                columnNumber: 188
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
        lineNumber: 44,
        columnNumber: 110
    }, this);
}
function ContentRow({ title, meta, onEdit, onDelete }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "content-manage-row",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                        children: title
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                        lineNumber: 45,
                        columnNumber: 160
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: meta
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                        lineNumber: 45,
                        columnNumber: 184
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                lineNumber: 45,
                columnNumber: 155
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "manage-actions",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: onEdit,
                        children: "Edit"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                        lineNumber: 45,
                        columnNumber: 241
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "danger",
                        onClick: onDelete,
                        children: "Delete"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                        lineNumber: 45,
                        columnNumber: 279
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                lineNumber: 45,
                columnNumber: 209
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
        lineNumber: 45,
        columnNumber: 119
    }, this);
}
function GalleryManager({ data, run }) {
    async function submit(event) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        await run('gallery', ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["api"].createGalleryPhoto({
                imageUrl: String(form.get('imageUrl')),
                title: String(form.get('title')),
                caption: String(form.get('caption')) || undefined
            }), 'Photo added to the gallery.');
        event.currentTarget.reset();
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "manage-grid",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "portal-card",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    className: "portal-form",
                    onSubmit: submit,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionTitle, {
                            title: "Add gallery photo",
                            text: "Add a hosted photo link and it will appear in the moving public gallery."
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                            lineNumber: 46,
                            columnNumber: 589
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            name: "imageUrl",
                            type: "url",
                            required: true,
                            placeholder: "Photo URL"
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                            lineNumber: 46,
                            columnNumber: 710
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            name: "title",
                            required: true,
                            placeholder: "Photo title"
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                            lineNumber: 46,
                            columnNumber: 778
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                            name: "caption",
                            placeholder: "Short caption (optional)"
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                            lineNumber: 46,
                            columnNumber: 834
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            className: "btn btn--primary",
                            children: "Add to gallery"
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                            lineNumber: 46,
                            columnNumber: 899
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                    lineNumber: 46,
                    columnNumber: 541
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                lineNumber: 46,
                columnNumber: 508
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "portal-card",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionTitle, {
                        title: "Gallery library",
                        text: "View and remove photos published in the past."
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                        lineNumber: 46,
                        columnNumber: 1009
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "admin-gallery-grid",
                        children: data.galleryPhotos.length ? data.galleryPhotos.map((photo)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                        src: photo.imageUrl,
                                        alt: photo.title
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                                        lineNumber: 46,
                                        columnNumber: 1218
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: photo.title
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                                                lineNumber: 46,
                                                columnNumber: 1268
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>void run(photo.id, ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["api"].deleteGalleryPhoto(photo.id), 'Gallery photo deleted.'),
                                                children: "Delete"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                                                lineNumber: 46,
                                                columnNumber: 1298
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                                        lineNumber: 46,
                                        columnNumber: 1263
                                    }, this)
                                ]
                            }, photo.id, true, {
                                fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                                lineNumber: 46,
                                columnNumber: 1194
                            }, this)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Empty, {
                            text: "No gallery photos have been added yet."
                        }, void 0, false, {
                            fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                            lineNumber: 46,
                            columnNumber: 1434
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                        lineNumber: 46,
                        columnNumber: 1101
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
                lineNumber: 46,
                columnNumber: 976
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/app/(public)/admin/page.tsx",
        lineNumber: 46,
        columnNumber: 479
    }, this);
}
}),
];

//# sourceMappingURL=_73f26505._.js.map