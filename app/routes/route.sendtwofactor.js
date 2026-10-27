import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { createChallenges } from "../services/TwoFactorAuthentication.js";

// TODO Ambil user dari table users di Database
async function getUserById(id) {
    return { id, email: 'zidanhp255@gmail.com', twoFactorEnabled: false };
}

const router = Router();

export default router.post("/login/verify", requireAuth, async (req, res) => {
    const user = await getUserById(req.body.user.id);

    try {
        const { challengeId, expiresIn } = await createChallenges({
            user,
            purpose: 'login'
        });

        res.json({ challengeId, expiresIn });
    } catch (err) {
        if (err.status === 429) {
            res.set("Retry-After", String(err.retryAfter));
            return res.status(429).json({ error: err.message });
        }
        res.status(500).json({ error: "Gagal mengirim kode, coba lagi!" });
    }
});