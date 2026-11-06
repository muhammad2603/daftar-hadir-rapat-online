import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { verifyChallenge } from "../services/TwoFactorAuthentication.js"
import { activate2FA, updateLastLogin } from "../models/UsersModel.js";
import { registerDevice } from "../services/Device.js";
import { twoFaVerifyLimiter } from "../middlewares/rateLimit.js";
import { signToken, clearAuthCookie, setAuthCookie } from "../services/JWT.js";
import { HttpError } from "../error_handlers/HttpError.js";
import { ERR } from "../error_handlers/ErrorCodes.js";

const cookieOptions = {
    httpOnly: true,
    secure: process.env.APP_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 60 * 1000,
};

const router = Router();

export default router.post("/auth/security/2fa/verify", twoFaVerifyLimiter, requireAuth, async (req, res) => {
    const { code, trustDevice } = req.body ?? {};
    const purpose = req.cookies?.purpose;
    const challengeId = req.cookies?.challengeId;
    if (!purpose || !challengeId || !['activate', 'login'].includes(purpose)) {
        // TODO
        /**
         * Cek apakah cookie purpose atau challenge id tidak ada? jika tidak ada,
         * Arahkan ke-halaman login, redirect login ditambahkan ke-param 4 di HttpError (extra)
         */
        throw new HttpError(400, "Terjadi kesalahan saat verifikasi, coba lagi nanti.", ERR.BAD_REQUEST);
    }
    if (purpose === 'activate' && !req.user.isFullyAuthenticated) {
        throw new HttpError(401, "Anda belum ter-autentikasi secara penuh.", ERR.NOT_FULL_AUTHENTICATED);
    }
    const userId = req.user.id;
    try {
        await verifyChallenge({ challengeId, code, purpose, userId });
    } catch (err) {
        if (err.status === 429 || err.appCode === ERR.CHALLENGE_EXPIRED) {
            res.cookie("superseded", "true", cookieOptions);
            res.cookie("challengeIdSuperseded", challengeId, cookieOptions);
            return res.status(err.status).json({
                error: err.message,
                superseded: true,
                code: (err.appCode === ERR.CHALLENGE_EXPIRED) ? ERR.CHALLENGE_EXPIRED : ERR.CHALLENGE_SUPERSEDED,
            });
        }
        throw err;
    }
    if (purpose === 'activate') {
        await activate2FA(userId, req.user.email);
    } else {
        if (trustDevice === true) await registerDevice({ userId, req, res });
        await updateLastLogin(userId, new Date());
        clearAuthCookie(res);
        setAuthCookie(res, signToken(req.user, true));
    }
    res.clearCookie("purpose", cookieOptions);
    res.clearCookie("challengeId", cookieOptions);
    return res.status(200).json({ valid: true });
});