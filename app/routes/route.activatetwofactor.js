import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { createChallenges } from "../services/TwoFactorAuthentication.js";

const router = Router();

router.get("/auth/security/2fa/activate", requireAuth, async (req, res) => {
    try {
        const user = req.user;
        if (user.twoFactorEnabled) {
            return res.status(409).json({ error: "Two-Factor Authentication telah aktif!" });
        }
        // TODO Gunakan mekanisme sessionStorage untuk menyimpan purpose, untuk memudahkan permintaan verifikasi kode 2FA.
        const purpose = 'activate';
        const { challengeId, expiresIn } = await createChallenges({
            user,
            purpose
        });
        // TODO Ganti dengan render view untuk halaman aktivasi two-factor auth
        res.json({ challengeId, expiresIn });
    } catch (err) {
        if (err.status === 429) {
            res.set("Retry-After", String(err.retryAfter));
            return res.status(429).json({ error: err.message });
        }
        res.status(500).json({ error: "Gagal mengirim kode, coba lagi!" });
    }
});

export default router;
