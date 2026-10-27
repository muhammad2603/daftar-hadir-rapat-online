import crypto from 'node:crypto';
import { generateSecret, generate, verify } from 'otplib';
import { transporter } from '../config/config.smtp.js';
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

// TODO Simpan challenges dan last sent di Database
const challenges = new Map();
const lastSent = new Map();

const SUBJECTS = {
    activate: 'Kode aktivasi 2FA Anda',
    login: 'Kode verifikasi login Anda'
};

/**
 * Kirim kode 2FA ke-email pengguna yang ter-autentikasi
 * 
 * @param {ChallengeInput} input
 */
async function createChallenges({ user, purpose }) {
    const key = `${user}:${purpose}`;
    const now = Date.now();
    // Hitung waktu dari permintaan sebelumnya
    const wait = COOLDOWN_MS - (now - (lastSent.get(key) ?? 0));
    // Jika belum melewati cooldown, cegah permintaan
    if (wait > 0) {
        const err = new Error("Tunggu sebentar sebelum meminta kode kembali.");
        err.status = 429;
        err.retryAfter = Math.ceil(wait / 1000);
        throw err;
    }
    // Siapkan kode verifikasi
    const secret = generateSecret();
    const token = await generate({ secret, period: PERIOD });
    const challengeId = crypto.randomUUID();
    // Hapus semua challenge yang tersimpan
    for (const [id, c] of challenges) {
        if (c.userId = user.id && c.purpose === purpose) challenges.delete(id);
    }
    // Simpan challenge baru
    challenges.set(challengeId, {
        userId: user.id,
        purpose,
        secret,
        attempts: 0,
        expiresAt: now + PERIOD * 1000,
    });
    try {
        await transporter.sendMail({
            from: '"SIDARO APP" <' + SMTP_USER + '>',
            to: user.email,
            subject: SUBJECTS[purpose],
            text: `Kode verifikasi: ${token}\nBerlaku sekitar 5 menit. Jangan bagikan kode ini.`,
        });
    } catch (e) {
        // Hapus challenge yang baru dibuat jika terjadi error saat pengiriman kode verifikasi ke-email pengguna
        challenges.delete(challengeId);
        throw e;
    }
    // Simpan kode verifikasi dan waktu dibuat
    lastSent.set(key, now);
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

    const ch = challenges.get(challengeId);

    if (
        !ch ||
        Date.now() > ch.expiresAt ||
        ch.purpose !== purpose ||
        ch.userId !== userId
    ) {
        // Hapus challenge jika telah kadaluarsa
        if (ch && Date.now() > ch.expiresAt) challenges.delete(challengeId);
        throw fail(401, 'Kode telah kedaluwarsa atau tidak valid.');
    }

    if (ch.attempts >= MAX_ATTEMPTS) {
        challenges.delete(challengeId);
        throw fail(429, 'Terlalu banyak percobaan. Silahkan minta kode baru!');
    }

    const token = String(code ?? '');
    const formatOk = /^\d{6}$/.test(token);

    const checkToken = formatOk
        ? await verify({ secret: ch.secret, token, period: PERIOD, epochTolerance: PERIOD })
        : { valid: false };

    if (!checkToken.valid) {
        // Jika token yang diberikan tidak valid, tambahkan jumlah attempts
        ch.attempts += 1;
        if (ch.attempts >= MAX_ATTEMPTS) challenges.delete(challengeId);
        throw fail(401, "Kode verifikasi salah!");
    }
    // Hapus token agar hanya digunakan sekali 
    challenges.delete(challengeId);
    return { valid: true };
}

export {
    createChallenges,
    verifyChallenge
};