import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { createChallenges } from "../services/TwoFactorAuthentication.js";
import { twoFaResendLimiter } from "../middlewares/rateLimit.js";
import { HttpError } from "../error_handlers/HttpError.js";
import { ERR } from "../error_handlers/ErrorCodes.js";

const router = Router();

const cookieOptions = {
    httpOnly: true,
    secure: process.env.APP_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 60 * 1000,
};

router.post("/auth/security/2fa/resend", twoFaResendLimiter, requireAuth, async (req, res) => {
    const user = req.user;
    const isSuperseded = req.cookies?.["superseded"];
    const purpose = req.cookies?.["purpose"];
    const allowedPurposed = ["activate", "login"];
    const challengeIdSuperseded = req.cookies?.["challengeIdSuperseded"];
    if (
        (!isSuperseded || isSuperseded !== 'true') ||
        (!purpose || !allowedPurposed.includes(purpose)) ||
        !challengeIdSuperseded
    ) {
        throw new HttpError(400, "Gagal mengirim ulang kode verifikasi, coba lagi nanti.", ERR.BAD_REQUEST);
    }
    if (purpose === 'activate' && !req.user.isFullyAuthenticated) {
        throw new HttpError(401, "Anda belum ter-autentikasi secara penuh.", ERR.NOT_FULL_AUTHENTICATED);
    }
    try {
        const { challengeId, expiresIn } = await createChallenges({
            user,
            purpose
        }, true, challengeIdSuperseded);
        res.clearCookie("superseded", cookieOptions);
        res.clearCookie("purpose", cookieOptions);
        res.clearCookie("challengeIdSuperseded", cookieOptions);
        res.cookie("purpose", purpose, cookieOptions);
        res.cookie("challengeId", challengeId, cookieOptions);
        res.json({ challengeId, expiresIn });
    } catch (err) {
        throw err;
    }
});

export default router;