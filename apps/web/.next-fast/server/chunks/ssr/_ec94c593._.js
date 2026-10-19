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
"[project]/apps/web/src/app/(public)/sermons/[id]/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SermonDetail
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.5.25_@types+node@22.20.2_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.5.25_@types+node@22.20.2_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.5.25_@types+node@22.20.2_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/api.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
function SermonDetail({ params }) {
    const { id } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["use"])(params);
    const [item, setItem] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(undefined);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["api"].sermons().then((items)=>setItem(items.find((entry)=>entry.id === id) || null)).catch(()=>setItem(null));
    }, [
        id
    ]);
    if (item === undefined) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "detail-page",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "container",
            children: "Loading sermon…"
        }, void 0, false, {
            fileName: "[project]/apps/web/src/app/(public)/sermons/[id]/page.tsx",
            lineNumber: 5,
            columnNumber: 361
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/web/src/app/(public)/sermons/[id]/page.tsx",
        lineNumber: 5,
        columnNumber: 331
    }, this);
    if (!item) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "detail-page",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "container",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                    children: "Sermon not found."
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/app/(public)/sermons/[id]/page.tsx",
                    lineNumber: 5,
                    columnNumber: 490
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    className: "text-link",
                    href: "/sermons",
                    children: "Back to sermons"
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/app/(public)/sermons/[id]/page.tsx",
                    lineNumber: 5,
                    columnNumber: 516
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/apps/web/src/app/(public)/sermons/[id]/page.tsx",
            lineNumber: 5,
            columnNumber: 463
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/web/src/app/(public)/sermons/[id]/page.tsx",
        lineNumber: 5,
        columnNumber: 433
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "detail-page",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
            className: "container detail-article",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "eyebrow",
                    children: [
                        "MESSAGE · ",
                        new Date(item.preachedAt).toLocaleDateString()
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/web/src/app/(public)/sermons/[id]/page.tsx",
                    lineNumber: 5,
                    columnNumber: 679
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                    children: item.title
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/app/(public)/sermons/[id]/page.tsx",
                    lineNumber: 5,
                    columnNumber: 764
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "detail-speaker",
                    children: [
                        "Shared by ",
                        item.speaker
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/web/src/app/(public)/sermons/[id]/page.tsx",
                    lineNumber: 5,
                    columnNumber: 785
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "detail-copy",
                    children: item.summary
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/app/(public)/sermons/[id]/page.tsx",
                    lineNumber: 5,
                    columnNumber: 843
                }, this),
                item.videoUrl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                    className: "btn btn--primary",
                    href: item.videoUrl,
                    target: "_blank",
                    children: "Watch message ↗"
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/app/(public)/sermons/[id]/page.tsx",
                    lineNumber: 5,
                    columnNumber: 908
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                    fileName: "[project]/apps/web/src/app/(public)/sermons/[id]/page.tsx",
                    lineNumber: 5,
                    columnNumber: 997
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$25_$40$types$2b$node$40$22$2e$20$2e$2_react$2d$dom$40$19$2e$3$2e$0_react$40$19$2e$3$2e$0_$5f$react$40$19$2e$3$2e$0$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    className: "text-link",
                    href: "/sermons",
                    children: "← All sermons"
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/app/(public)/sermons/[id]/page.tsx",
                    lineNumber: 5,
                    columnNumber: 1002
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/apps/web/src/app/(public)/sermons/[id]/page.tsx",
            lineNumber: 5,
            columnNumber: 633
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/web/src/app/(public)/sermons/[id]/page.tsx",
        lineNumber: 5,
        columnNumber: 603
    }, this);
}
}),
];

//# sourceMappingURL=_ec94c593._.js.map