import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { createChallenges } from "../services/TwoFactorAuthentication.js";
import { twoFaResendLimiter } from "../middlewares/rateLimit.js";

const router = Router();

const cookieOptions = {
    httpOnly: true,
    secure: process.env.APP_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 60 * 1000,
};

router.post("/auth/security/2fa/resend", twoFaResendLimiter, requireAuth, async (req, res) => {
    const fail = (statusCode, message) => {
        const error = new Error(message);
        error.status = statusCode;
        return error;
    }
    // TODO Seharusnya cookie superseded dan purpose memiliki kadaluwarsa, jika telah kedaluwarsa, arahkan ke-login kembali.
    const user = req.user;
    const isSuperseded = req.cookies?.["superseded"];
    const purpose = req.cookies?.["purpose"];
    const allowedPurposed = ["activate", "login"];
    const challengeIdSuperseded = req.cookies?.["challengeIdSuperseded"];
    try {
        if (
            (!isSuperseded || isSuperseded !== 'true') ||
            (!purpose || !allowedPurposed.includes(purpose)) ||
            !challengeIdSuperseded
        ) {
            throw fail(400, "Gagal mengirim kode verifikasi, coba lagi nanti.");
        }
        if (purpose === 'activate' && !req.user.isFullyAuthenticated) {
            throw fail(401, "Anda belum ter-autentikasi secara penuh.");
        }
        const { challengeId, expiresIn } = await createChallenges({
            user,
            purpose
        }, true, challengeIdSuperseded);
        res.clearCookie("superseded", cookieOptions);
        res.clearCookie("purpose", cookieOptions);
        res.clearCookie("challengeIdSuperseded", cookieOptions);
        res.cookie("purpose", purpose, cookieOptions);
        res.json({ challengeId, expiresIn });
    } catch (err) {
        if (err.status) {
            return res.status(err.status).json({ error: err.message });
        }
        res.status(500).json({ error: "Gagal mengirim kode baru! Coba lagi beberapa saat." });
    }
});

export default router;