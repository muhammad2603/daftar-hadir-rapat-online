import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { verifyChallenge } from "../services/TwoFactorAuthentication.js"

// TODO Tambahkan fungsi untuk melakukan UPDATE ke-user yang telah mengaktifkan 2FA. Hanya jika user melakukan aktivasi.

const cookieOptions = {
    httpOnly: true,
    secure: process.env.APP_ENV === 'production',
    sameSite: 'lax',
    path: '/'
};

const router = Router();

export default router.post("/auth/security/2fa/verify", requireAuth, async (req, res) => {
    const { code } = req.body ?? {};
    try {
        const purpose = req.cookies?.["purpose"];
        const challengeId = req.cookies?.["challengeId"];
        await verifyChallenge({
            challengeId,
            code,
            purpose,
            userId: req.user.id
        });

        // TODO Panggil fungsi UPDATE 2FA user, fungsi tidak boleh dijalankan jika purpose yang diminta bukan activate.

        // TODO Buat logika jika purpose adalah verifikasi setelah login, buat token JWT

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