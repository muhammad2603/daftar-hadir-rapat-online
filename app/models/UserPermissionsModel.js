import db from "../config/config.db.js";

const TABLE = "user_permissions";

/**
 * Mengambil value dari hasil satu field
 * 
 * @param {Object[]} items Hasil field
 * @param {string} fieldName Nama field yang dihasilkan
 */
const getOnlyValues = (items, fieldName) => {
    return items.map((field) => field[fieldName]);
}

/**
 * Mengambil hak izin pengguna berdasarkan user id
 * @param {number} userId
 * 
 * @returns {Promise<{
 *      granted: string[],
 *      denied: string[],
 *  }>}
 */
export async function getUserPermissions(userId) {
    /** @type {[{ permission: string }]} */
    const granted = await db(TABLE).select("permission").where({ user_id: userId, effect: "grant" });
    /** @type {[{ permission: string }]} */
    const denied = await db(TABLE).select("permission").where({ user_id: userId, effect: "deny" });
    return {
        granted: getOnlyValues(granted, "permission"),
        denied: getOnlyValues(denied, "permission"),
    }
}