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
    const fail = (status, message) => {
        const error = new Error(message);
        error.status = status;
        return error;
    }
    try {
        const body = req.body ?? {};
        if (!body.username || !body.password) {
            throw fail(401, "Username atau password salah!");
        }
        const usernameRegex = /[^a-z_\d]/;
        if (usernameRegex.test(usernameReq)) {
            throw fail(401, "Username atau password salah!");
        }
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&*])[A-Za-z\d@#$%^&*]{8,20}$/;
        if (!passwordRegex.test(passwordReq)) {
            throw fail(401, "Username atau password salah!");
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
        return res.json({ ok: true, redirect: '/dashboard' });
    } catch (err) {
        if (err.status === 429) {
            res.set("Retry-After", String(err.retryAfter));
            return res.status(429).json({ error: err.message });
        }
        if (err.status) {
            return res.status(err.status).json({ error: err.message });
        }
        res.status(500).json({ error: "Terjadi kesalahan, coba lagi nanti." });
    }
});

/**
 * Sensor string
 * 
 * @param {string} string String yang akan disensor
 * @param {string} [censorChar] Karakter yang digunakan untuk sensor string
 * @param {number} [repeatCensorChar] Jumlah karakter sensor
 * @param {number} [startAt] Posisi awal sensor pada string
 * @param {number} [endAt] Posisi akhir sensor pada string, posisi dihitung dari akhir string (strLength - endAt).
 */
function censorString(string, censorChar = '*', repeatCensorChar = 5, startAt = 2, endAt = 1) {
    const strLen = string.length;
    const endPosByTotalLen = strLen - endAt;
    const sliceStr = string.substring(startAt, endPosByTotalLen);
    const censored = string.replace(sliceStr, censorChar.repeat(repeatCensorChar));
    return censored;
}

/**
 * Sensor email pengguna
 * 
 * @param {string} email
 */
function hideUserEmail(email) {
    const splitChar = '@';
    const splitEmail = email.split(splitChar);
    const [identity, domain] = splitEmail;
    const censoredEmail = censorString(identity);
    return censoredEmail + splitChar + domain;
}

/**
 * Route Verifikasi 2FA yang Terpicu Setelah Login
 */
router.get("/login/2fa-verification", requireAuth, async (req, res) => {
    const censorUserEmail = hideUserEmail(req.user.email);
    return res.render("backend/2fa_verification_after_login", {
        title: process.env.SITE_TITLE,
        email: censorUserEmail
    });
});

export default router;