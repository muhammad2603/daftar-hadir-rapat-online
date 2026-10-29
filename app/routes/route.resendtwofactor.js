import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { createChallenges } from "../services/TwoFactorAuthentication.js";

const router = Router();

const cookieOptions = {
    httpOnly: true,
    secure: process.env.APP_ENV === 'production',
    sameSite: 'lax',
    path: '/'
};

router.post("/auth/security/2fa/resend", requireAuth, async (req, res) => {
    const fail = (statusCode, message) => {
        const error = new Error(message);
        error.status = statusCode;
        return error;
    }
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
            throw fail(400, "Permintaan gagal!");
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