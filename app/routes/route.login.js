import { Router } from "express";
import { loginAttempt, isLoggedIn } from "../services/LoginHandler.js";
import { setAuthCookie, signToken } from "../services/JWT.js";
import { requireAuth } from "../middlewares/auth.js";
import { createChallenges } from "../services/TwoFactorAuthentication.js";
import { updateLastLogin } from "../models/UsersModel.js";
import { evaluateLogin, touchDevice } from "../services/Device.js";
import { loginLimiter } from "../middlewares/rateLimit.js";
import 'dotenv/config';

const router = Router();

const cookieOptions = {
    httpOnly: true,
    secure: process.env.APP_ENV === 'production',
    sameSite: 'lax',
    path: '/'
};

/**
 * Route Form Login
 */
router.get("/", isLoggedIn, (_, res) => {
    res.render("frontend/login", {
        title: process.env.SITE_TITLE
    });
});

/**
 * Route Endpoint Percobaan Login
 */
router.post("/login", loginLimiter, isLoggedIn, async (req, res) => {
    try {
        const body = req.body ?? {};
        if (!body.username || !body.password) {
            const error = new Error("Username atau password salah!");
            error.status = 401;
            throw error;
        }
        const { username: usernameReq, password: passwordReq } = body;
        const { user } = await loginAttempt(usernameReq, passwordReq);
        const { requires2fa, device, geo, reason } = await evaluateLogin({ user, req });
        if (requires2fa) {
            const token = signToken(user);
            setAuthCookie(res, token);
            const purpose = "login";
            const { challengeId } = await createChallenges({ user, purpose });
            res.cookie("purpose", purpose, cookieOptions);
            res.cookie("challengeId", challengeId, cookieOptions);
            return res.json({ requires2fa: true, redirect: '/login/2fa-verification', reason });
        }
        const token = signToken(user, true);
        setAuthCookie(res, token);
        if (device) await touchDevice(device, { geo, req });
        const currDate = new Date();
        updateLastLogin(user.id, currDate);
        return res.json({ ok: true });
    } catch (err) {
        if (err.status === 429) {
            res.set("Retry-After", String(err.retryAfter));
            return res.status(429).json({ error: err.message });
        }
        if (err.status) {
            return res.status(err.status).json({ message: err.message });
        }
        res.status(500).json({ error: "Terjadi kesalahan, coba lagi nanti." });
    }
});

/**
 * Route Verifikasi 2FA yang Terpicu Setelah Login
 */
router.get("/login/2fa-verification", requireAuth, async (req, res) => {
    return res.render("backend/2fa_verification_after_login", {
        title: process.env.SITE_TITLE,
        // TODO Ambil email pengguna dari payload JWT dan pastikan disensor
        email: 'bu****2@gmail.com'
    });
});

export default router;