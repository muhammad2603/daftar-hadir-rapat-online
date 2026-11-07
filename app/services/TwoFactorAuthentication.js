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
import { HttpError } from '../error_handlers/HttpError.js';
import { ERR } from '../error_handlers/ErrorCodes.js';

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

/**
 * Kirim kode 2FA ke-email pengguna yang ter-autentikasi
 * 
 * @param {ChallengeInput} input
 * @param {boolean} [isSuperseded]
 * Apakah token sebagai pengganti? default `false`.
 * @param {string} [supersedChallengeId]
 * Challenge ID (primary key) yang akan digantikan, default `false`.
 * 
 * @throws Melempar error dengan status `429 (Too Many Request)`
 */
async function createChallenges({ user, purpose }, isSuperseded = false, supersedChallengeId = false) {
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
        if (isSuperseded === true && supersedChallengeId !== false) {
            await setTokenToUsed(supersedChallengeId, "superseded");
        }
        // TODO Enkripsi secret menggunakan algoritma AES-256-GCM, simpan kunci enkripsi di .env
        await insertToken({
            challenge_id: challengeId,
            user_id: user.id,
            purpose,
            secret,
            attempts: 0,
            expires_at: now + (PERIOD * 1000)
        });
        // __FIX__
        /**
         * Jika pengguna tiba-tiba terputus dari koneksi, transporter akan mengirim Error Code.
         * Error Log:
         * 
         * ErrCode: EDNS
         * Error: DNS lookup for smtp.gmail.com timed out
         * 
         * Server akan mengirim status 500 karena tidak ada yang menangani error tersebut. Tambahkan dierror global di server.js
         */
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
    const ch = await getToken(challengeId);
    if (
        !ch ||
        Date.now() > ch.expires_at ||
        ch.purpose !== purpose ||
        ch.user_id !== userId
    ) {
        if (ch && Date.now() > ch.expires_at) await setTokenToUsed(challengeId, "expired");
        throw new HttpError(401, 'Kode telah kedaluwarsa atau tidak valid.', ERR.CHALLENGE_EXPIRED);
    }
    if (ch.attempts >= MAX_ATTEMPTS) {
        await setTokenToUsed(challengeId, "locked");
        throw new HttpError(429, 'Terlalu banyak percobaan. Silahkan minta kode baru!', ERR.TOO_MANY_REQUEST);
    }
    const token = String(code ?? '');
    const formatOk = /^\d{6}$/.test(token);
    // TODO Jika secret telah dienkripsi, ch.secret perlu didekripsi.
    const checkToken = (formatOk && ch.secret !== null)
        ? await verify({ secret: ch.secret, token, period: PERIOD, epochTolerance: PERIOD })
        : { valid: false };
    if (!checkToken.valid) {
        await increaseAttempt(challengeId);
        throw new HttpError(401, "Kode verifikasi salah!", ERR.INVALID_CODE_VERIFICATION);
    }
    setTokenAsVerified(challengeId);
    return { valid: true };
}

export {
    createChallenges,
    verifyChallenge
};