import crypto from 'node:crypto';
import { generateSecret, generate, verify } from 'otplib';
import { transporter } from '../config/config.smtp.js';
import {
    insertToken,
    getLastTokenExpires,
    setTokenToUsed,
    setTokenAsVerified,
    getToken,
    increaseAttempt,
} from '../models/AuthToken2FAModel.js';
import 'dotenv/config';

/**
 * @typedef {Object} ChallengeInput
 * 
 * @property {{ id: number, email: string }} user
 * @property { "activate" | "login" } purpose
 */

/**
 * @typedef {Object} ChallengeVerify
 * 
 * @property {string} challengeId
 * @property {string} code
 * Kode verifikasi 6-digit
 * @property { "activate" | "login" } purpose
 * @property {string} userId
 */


const PERIOD = Number(process.env.TOTP_PERIOD);
const SMTP_USER = String(process.env.SMTP_USER);
const COOLDOWN_MS = 60_000;

const SUBJECTS = {
    activate: 'Kode aktivasi 2FA Anda',
    login: 'Kode verifikasi login Anda'
};

// TODO Tambahkan mekanisme resend kode 2FA.

/**
 * Kirim kode 2FA ke-email pengguna yang ter-autentikasi
 * 
 * @param {ChallengeInput} input
 * 
 * @throws Melempar error dengan status `429 (Too Many Request)`
 */
async function createChallenges({ user, purpose }) {
    const now = Date.now();
    const getLastSentChallenge = await getLastTokenExpires(user.id, purpose);
    const wait = COOLDOWN_MS - (now - (getLastSentChallenge ?? 0));
    if (wait > 0) {
        const err = new Error("Tunggu sebentar sebelum meminta kode kembali.");
        err.status = 429;
        err.retryAfter = Math.ceil(wait / 1000);
        throw err;
    }
    const secret = generateSecret();
    const token = await generate({ secret, period: PERIOD });
    const challengeId = crypto.randomUUID();
    try {
        await insertToken({
            challenge_id: challengeId,
            user_id: user.id,
            purpose,
            secret,
            attempts: 0,
            expires_at: now + (PERIOD * 1000)
        });
        await transporter.sendMail({
            from: '"SIDARO APP" <' + SMTP_USER + '>',
            to: user.email,
            subject: SUBJECTS[purpose],
            text: `Kode verifikasi: ${token}\nBerlaku sekitar 5 menit. Jangan bagikan kode ini.`,
        });
    } catch (e) {
        await setTokenToUsed(challengeId, 'send_failed');
        throw e;
    }
    return { challengeId, expiresIn: PERIOD };
}

/** Maksimal percobaan verifikasi */
const MAX_ATTEMPTS = 5;

/**
 * Verifikasi kode 2FA
 * 
 * @param {ChallengeVerify} config
 * 
 * @returns {Promise<{ valid: boolean }>}
 * 
 * @throws {Error}
 * Dengan properti `status`: 401 (kode salah, kedaluwarsa, atau tidak valid) atau 429 (terlalu banyak percobaan).
 */
async function verifyChallenge({ challengeId, code, purpose, userId }) {
    const fail = (status, message) => {
        const err = new Error(message);
        err.status = status;
        return err;
    }
    const ch = await getToken(challengeId);
    if (
        !ch ||
        Date.now() > ch.expires_at ||
        ch.purpose !== purpose ||
        ch.user_id !== userId
    ) {
        if (ch && Date.now() > ch.expires_at) await setTokenToUsed(challengeId, "expired");
        throw fail(401, 'Kode telah kedaluwarsa atau tidak valid.');
    }
    if (ch.attempts >= MAX_ATTEMPTS) {
        await setTokenToUsed(challengeId, "locked");
        throw fail(429, 'Terlalu banyak percobaan. Silahkan minta kode baru!');
    }
    const token = String(code ?? '');
    const formatOk = /^\d{6}$/.test(token);
    const checkToken = formatOk
        ? await verify({ secret: ch.secret, token, period: PERIOD, epochTolerance: PERIOD })
        : { valid: false };
    if (!checkToken.valid) {
        await increaseAttempt(challengeId);
        throw fail(401, "Kode verifikasi salah!");
    }
    setTokenAsVerified(challengeId);
    return { valid: true };
}

export {
    createChallenges,
    verifyChallenge
};