/**
 * @typedef {Object} UserDevicesFields
 * 
 * @property {string} id UUID String (36 Characters)
 * @property {number} user_id
 * @property {string} device_token_hash Device token hash (HEX)
 * @property {string|null} user_agent
 * @property {string|null} last_country Kode Negara dengan format ISO 2 huruf
 * @property {string|null} last_city
 * @property {number|null} last_asn AS Number (ASN)
 * @property {Date} trusted_until Catatan waktu masa berlaku device token
 * @property {Date|null} revoked_at Catatan waktu device token dicabut
 * @property {Date} first_seen_at Catatan waktu pertama kali dilihat
 * @property {Date} last_seen_at Catatan waktu terakhir kali dilihat
 */

import db from '../config/config.db.js';

/** @typedef {string} TABLE Nama table */
const TABLE = "user_devices";

/**
 * Mengambil device yang telah ke-record berdasarkan User ID dan Hash Token
 * 
 * @param {number} userId
 * @param {string} tokenHash
 * 
 * @returns {Promise<UserDevicesFields | null>}
 */
export async function findDevice(userId, tokenHash) {
    return db(TABLE)
        .select()
        .where({
            user_id: userId,
            device_token_hash: tokenHash
        })
        .first();
}

/**
 * Menyimpan device pengguna
 * 
 * @param {UserDevicesFields} data
 */
export async function insertDevice(data) {
    return db(TABLE).insert(data);
}

/**
 * Memperbarui device berdasarkan id
 * 
 * @param {string} id UUID Primary Key
 * @param {UserDevicesFields} data
 */
export async function updateDevice(id, data) {
    return db(TABLE)
        .where({ id })
        .update(data);
}