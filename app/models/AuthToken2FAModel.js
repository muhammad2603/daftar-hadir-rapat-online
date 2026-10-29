/**
 * @typedef {Object} Fields
 * 
 * @property {string} challenge_id Primary Key
 * @property {number} user_id User ID yang meminta token
 * @property {"active" | "login"} purpose Subject token
 * @property {string} secret Secret yang di-generate otplib
 * @property {number} [attempts] Default 0
 * @property {number} expires_at Waktu token berakhir dalam timestamp javascript (13-digit)
 * @property {boolean} [is_used] `TRUE` jika token telah dipakai, default `FALSE`.
 * @property {string} [created_at] Waktu record dibuat, default `CURRENT_TIMESTAMP()`.
 */

/**
 * 
 * Definisi opsi:
 * "verified": Token sudah diverifikasi atau valid.
 * "superseded": Token telah diganti dengan token yang baru.
 * "locked": Token dikunci setelah batas maksimal percobaan tercapai.
 * "expired": Token sudah kedaluwarsa.
 * "send_failed": Token gagal terkirim ke-email pengguna.
 * 
 * @typedef {"verified" | "superseded" | "locked" | "expired" | "send_failed"} ReasonTokenUsed
 */

/**
 * @typedef {Object} ReturnFields
 * 
 * @property {string} challenge_id
 * @property {number} user_id
 * @property {string} purpose
 * @property {string} secret
 * @property {number} attempts
 * @property {number} expires_at
 * @property {boolean} is_used
 * @property {string} created_at
 */

import db from '../config/config.db.js';

const TABLE = 'auth_token_2fa';

/**
 * Mengambil token berdasarkan primary key
 * 
 * @param {string} challengeId Primary key
 * 
 * @return {Promise<ReturnFields | undefined>}
 * `undefined` jika tidak ada token yang ditemukan.
 */
export async function getToken(challengeId) {
    return await db(TABLE)
        .select()
        .where({
            challenge_id: challengeId
        })
        .first();
}

/**
 * Menyimpan token 2FA
 * 
 * @param {Fields} data
 */
export async function insertToken(data) {
    return await db(TABLE).insert(data);
}

/**
 * Mengambil waktu kedaluwarsa dari token yang terakhir kali tersimpan
 * 
 * @param {number} userId
 * @param {"activate" | "login"} purpose
 * 
 * @return {Promise<number | undefined>}
 * `undefined` jika tidak ada yang ditemukan.
 */
export async function getLastTokenExpires(userId, purpose) {
    const user_id = Number(userId);
    const result = await db(TABLE)
        .select()
        .where({
            user_id,
            purpose,
            is_used: false,
            used_reason: null
        })
        .orderBy("created_at", 'desc')
        .first();
    if (!result) return undefined;
    return Number(result.expires_at);
}

/**
 * Update semua token yang belum digunakan menjadi telah digunakan
 * 
 * @param {string} challengeId
 * @param {ReasonTokenUsed} reason Alasan token digunakan.
 */
export async function setTokenToUsed(challengeId, reason) {
    return db(TABLE)
        .where({
            challenge_id: challengeId,
            is_used: false
        })
        .update({
            secret: null,
            is_used: true,
            used_reason: reason
        });
}

/**
 * Menandai token sebagai diverifikasi
 * 
 * @param {string} challengeId Primary key
 */
export async function setTokenAsVerified(challengeId) {
    return await db(TABLE)
        .where({
            challenge_id: challengeId
        })
        .update({
            secret: null,
            is_used: true,
            used_reason: "verified"
        });
}

/**
 * Tambah nilai attempts token
 * 
 * @param {string} challengeId
 */
export async function increaseAttempt(challengeId) {
    return await db(TABLE)
        .where({
            challenge_id: challengeId
        })
        .increment("attempts", 1);
}