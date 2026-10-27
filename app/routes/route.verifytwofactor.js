import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { verifyChallenge } from "../services/TwoFactorAuthentication.js"

// TODO Tambahkan fungsi untuk melakukan UPDATE ke-user yang telah mengaktifkan 2FA. Hanya jika user melakukan aktivasi.

const router = Router();

export default router.post("/auth/security/2fa/verify", requireAuth, async (req, res) => {
    const { challengeId, code, user } = req.body ?? {};

    try {
        // TODO Ambil purpose dari sessionStorage yang telah dibuat (purpose memiliki 2 value berbeda)
        const purpose = '[PURPOSE]';

        // TODO Sesuaikan value dari property purpose berdasarkan permintaan
        await verifyChallenge({
            challengeId,
            code,
            purpose,
            userId: user.id
        });

        // TODO Panggil fungsi UPDATE 2FA user, fungsi tidak boleh dijalankan jika purpose yang diminta bukan activate.

        return res.status(200).json({ valid: true });
    } catch (err) {
        if (err.status) return res.status(err.status).json({ error: err.message });
        return res.status(500).json({ error: "Terjadi kesalahan saat verifikasi, silahkan coba lagi!" });
    }
});