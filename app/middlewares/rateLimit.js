import rateLimit from "express-rate-limit";

const base = {
    windowMs: 15 * 60 * 1000,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
};

/**
 * Limiter untuk percobaan login
 */
export const loginLimiter = rateLimit({
    ...base,
    limit: 10,
    skipSuccessfulRequests: true,
    message: { error: "Terlalu banyak upaya percobaan login, coba lagi nanti." },
});

/**
 * Limiter untuk percobaan verifikasi 2FA
 */
export const twoFaLimiter = rateLimit({
    ...base,
    limit: 15,
    message: { error: "Terlalu banyak upaya percobaan verifikasi, coba lagi nanti." },
});

/**
 * Limiter untuk permintaan pengiriman ulang kode verifikasi 2FA
 */
export const twoFaResendLimiter = rateLimit({
    ...base,
    limit: 3,
    message: { error: "Terlalu banyak upaya permintaan, coba lagi nanti." },
});