import rateLimit from "express-rate-limit";

// TODO
// Pasang Rate Limit Store agar memudahkan untuk melacak total hits.
// Jika total hits untuk verifikasi 2fa telah mencapai 3x lipat, arahkan halaman ke-login dan hapus semua cookie yang berkaitan.

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
export const twoFaVerifyLimiter = rateLimit({
    ...base,
    windowMs: 5 * 60 * 1000,
    limit: 5,
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