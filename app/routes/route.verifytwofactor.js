import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { verifyChallenge } from "../services/TwoFactorAuthentication.js"
import { activate2FA, updateLastLogin } from "../models/UsersModel.js";
import { registerDevice } from "../services/Device.js";
import { twoFaLimiter } from "../middlewares/rateLimit.js";
import { signToken, clearAuthCookie, setAuthCookie } from "../services/JWT.js";

const cookieOptions = {
    httpOnly: true,
    secure: process.env.APP_ENV === 'production',
    sameSite: 'lax',
    path: '/'
};

const router = Router();

export default router.post("/auth/security/2fa/verify", twoFaLimiter, requireAuth, async (req, res) => {
    const { code, trustDevice } = req.body ?? {};
    try {
        const purpose = req.cookies?.["purpose"];
        const challengeId = req.cookies?.["challengeId"];
        if (
            !purpose ||
            !challengeId ||
            (purpose !== 'activate' && purpose !== 'login')
        ) {
            const error = new Error("Terjadi kesalahan saat verifikasi, coba lagi nanti.");
            error.status = 400;
            throw error;
        }
        if (purpose === 'activate' && !req.user.isFullyAuthenticated) {
            const error = new Error("Anda belum ter-autentikasi secara penuh.");
            error.status = 401;
            throw error;
        }
        const userId = req.user.id;
        await verifyChallenge({
            challengeId,
            code,
            purpose,
            userId: userId
        });
        if (purpose === 'activate') {
            // TODO Daftarkan perangkat jika trustDevice diminta pengguna
            const userEmail = req.user.email;
            await activate2FA(userId, userEmail);
        }
        if (purpose === 'login') {
            if (trustDevice === true) await registerDevice({ userId, req, res });
            await updateLastLogin(userId, new Date());
            clearAuthCookie(res);
            const newToken = signToken(req.user, true);
            setAuthCookie(res, newToken);
        }
        res.clearCookie("purpose", cookieOptions);
        res.clearCookie("challengeId", cookieOptions);
        return res.status(200).json({ valid: true });
    } catch (err) {
        if (err.status === 429) {
            res.cookie("superseded", "true", cookieOptions);
            res.cookie("challengeIdSuperseded", challengeId, cookieOptions);
            return res.status(err.status).json({
                error: err.message,
                superseded: true
            });
        }
        if (err.status) return res.status(err.status).json({ error: err.message });
        return res.status(500).json({ error: "Terjadi kesalahan saat verifikasi, silahkan coba lagi!" });
    }
});