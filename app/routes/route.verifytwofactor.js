import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { verifyChallenge } from "../services/TwoFactorAuthentication.js"
import { activate2FA, updateLastLogin } from "../models/UsersModel.js";
import { registerDevice } from "../services/Device.js";

const cookieOptions = {
    httpOnly: true,
    secure: process.env.APP_ENV === 'production',
    sameSite: 'lax',
    path: '/'
};

const router = Router();

export default router.post("/auth/security/2fa/verify", requireAuth, async (req, res) => {
    const { code, trustDevice } = req.body ?? {};
    try {
        const purpose = req.cookies?.["purpose"];
        const challengeId = req.cookies?.["challengeId"];
        const userId = req.user.id;
        await verifyChallenge({
            challengeId,
            code,
            purpose,
            userId: userId
        });
        if (purpose === 'activate') {
            const userEmail = req.user.email;
            await activate2FA(userId, userEmail);
        }
        if (purpose === 'login') {
            if (trustDevice === true) await registerDevice({ userId, req, res });
            await updateLastLogin(userId, new Date());
        }
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