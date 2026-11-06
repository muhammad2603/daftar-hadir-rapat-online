import { Router } from "express";
import { loginAttempt, isLoggedIn } from "../services/LoginHandler.js";
import { setAuthCookie, signToken } from "../services/JWT.js";
import { requireAuth } from "../middlewares/auth.js";
import { createChallenges } from "../services/TwoFactorAuthentication.js";
import { updateLastLogin } from "../models/UsersModel.js";
import { evaluateLogin, touchDevice } from "../services/Device.js";
import { loginLimiter } from "../middlewares/rateLimit.js";
import { HttpError } from "../error_handlers/HttpError.js";
import 'dotenv/config';
import { ERR } from "../error_handlers/ErrorCodes.js";

const router = Router();

const cookieOptions = {
    httpOnly: true,
    secure: process.env.APP_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 60 * 1000,
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
    const body = req.body ?? {};
    if (!body.username || !body.password) {
        throw new HttpError(401, "Username atau password salah!", ERR.INVALID_CREDENTIALS);
    }
    const { username: usernameReq, password: passwordReq } = body;
    const usernameRegex = /[^a-z_\d]/;
    if (usernameRegex.test(usernameReq)) {
        throw new HttpError(401, "Username atau password salah!", ERR.INVALID_CREDENTIALS);
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&*])[A-Za-z\d@#$%^&*]{8,20}$/;
    if (!passwordRegex.test(passwordReq)) {
        throw new HttpError(401, "Username atau password salah!", ERR.INVALID_CREDENTIALS);
    }
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

// TODO Fungsi ini duplikasi dari app/middlewares/auth.js
/**
 * Fungsi untuk memberikan response dan redirect.
 * 
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {Object} responseError Response tidak akan dikirim jika request berasal dari browser
 * @param {string} redirectTo Lokasi redirect
 * @param {number} [status] HTTP Status Code tidak digunakan jika request berasal dari browser
 */
const setResponseWithRedirect = (req, res, responseError, redirectTo, status = 401) => {
    if (req.get('Accept')?.includes("application/json")) {
        return res.status(status).json(responseError);
    }
    return res.redirect(302, redirectTo);
};

/**
 * Route Verifikasi 2FA yang Terpicu Setelah Login
 */
router.get("/login/2fa-verification", requireAuth, async (req, res) => {
    const purposeCookie = req.cookies?.["purpose"];
    const challengeIdCookie = req.cookies?.["challengeId"];
    if (
        !purposeCookie ||
        !challengeIdCookie
    ) {
        return setResponseWithRedirect(req, res, { error: "Tidak dapat melakukan verifikasi kode. Coba login kembali!" }, '/', 400);
    }
    const censorUserEmail = hideUserEmail(req.user.email);
    return res.render("backend/2fa_verification_after_login", {
        title: process.env.SITE_TITLE,
        email: censorUserEmail
    });
});

export default router;