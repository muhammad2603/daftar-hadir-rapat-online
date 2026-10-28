import { Router } from "express";
import { loginAttempt } from "../services/LoginHandler.js";
import { setAuthCookie, signToken } from "../services/JWT.js";
import { requireAuth } from "../middlewares/auth.js";
import { createChallenges } from "../services/TwoFactorAuthentication.js";
import 'dotenv/config';

const router = Router();

router.get("/", (_, res) => {
    res.render("frontend/login", {
        title: process.env.SITE_TITLE
    });
});

router.post("/login", async (req, res) => {
    try {
        const body = req.body ?? {};
        if (!body.username || !body.password) {
            const error = new Error("Username atau password salah!");
            error.status = 401;
            throw error;
        }
        const { username, password } = body;
        const attempt = await loginAttempt(username, password);
        if (!attempt.isValid) {
            const error = new Error("Username atau password salah!");
            error.status = 401;
            throw error;
        }
        const token = signToken({ id: attempt.userId });
        setAuthCookie(res, token);
        return res.json({ ok: true });
    } catch (err) {
        if (err.status) {
            return res.status(err.status).json({ message: err.message });
        }
    }
});

// TODO Ambil user dari table users di Database
async function getUserById(id) {
    return { id, email: 'zidanhp255@gmail.com', twoFactorEnabled: false };
}

router.get("/login/2fa-verification", requireAuth, async (req, res) => {
    const user = await getUserById(req.user.id);

    try {
        // TODO Gunakan mekanisme sessionStorage untuk menyimpan purpose, untuk memudahkan permintaan verifikasi kode 2FA.
        const purpose = 'login';

        await createChallenges({
            user,
            purpose
        });

        return res.render("backend/2fa_verification_after_login", {
            title: process.env.SITE_TITLE,
            // TODO Ambil email pengguna dari payload JWT dan pastikan disensor
            email: 'bu****2@gmail.com'
        });
    } catch (err) {
        if (err.status === 429) {
            res.set("Retry-After", String(err.retryAfter));
            return res.status(429).json({ error: err.message });
        }
        res.status(500).json({ error: "Gagal mengirim kode, coba lagi!" });
    }
});

export default router;