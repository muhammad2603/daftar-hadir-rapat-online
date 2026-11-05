import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { createChallenges } from "../services/TwoFactorAuthentication.js";

const router = Router();

const cookieOptions = {
    httpOnly: true,
    secure: process.env.APP_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 60 * 1000,
};

router.get("/auth/security/2fa/activate", requireAuth, async (req, res) => {
    const purpose = 'activate';
    try {
        const user = req.user;
        if (user.email === null) {
            return res.status(400).json({ error: "Email belum ditambahkan!" });
        }
        if (user.twoFactorEnabled) {
            return res.status(409).json({ error: "Two-Factor Authentication telah aktif!" });
        }
        const { challengeId, expiresIn } = await createChallenges({
            user,
            purpose
        });
        res.cookie("purpose", purpose, cookieOptions);
        res.cookie("challengeId", challengeId, cookieOptions);
        // TODO Ganti dengan render view untuk halaman aktivasi two-factor auth
        res.json({ expiresIn });
    } catch (err) {
        if (err.status === 429) {
            res.set("Retry-After", String(err.retryAfter));
            return res.status(429).json({ error: err.message });
        }
        res.status(500).json({ error: "Gagal mengirim kode, coba lagi!" });
    }
});

export default router;
