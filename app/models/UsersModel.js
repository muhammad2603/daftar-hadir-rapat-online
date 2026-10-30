import db from "../config/config.db.js";

/**
 * Mengubah tipe data value menjadi Boolean
 * 
 * @param {string} value
 * 
 * @returns {boolean}
 */
const boolean = (value) => {
    return Boolean(value);
}

/**
 * Mengambil kredensial login pengguna
 * 
 * @param {string} username
 * 
 * @returns {Promise<{ id: number, username: string, password: string, email: string, role: string, is_2fa_active: boolean }>}
 */
export async function getCredentials(username) {
    try {
        const user = await db.table("users")
            .first('users.id', 'username', 'password', 'email', 'roles.nama AS role', 'is_2fa_active')
            .innerJoin('roles', 'roles.id', 'users.role_id')
            .where({ username });
        user.is_2fa_active = boolean(user.is_2fa_active);
        return user;
    } catch (err) {
        console.error("Gagal mengambil data user! Error:", err.message);
        const error = new Error("Terjadi kesalahan pada sistem!");
        error.status = 500;
        throw error;
    }
}

/**
 * Update status aktif 2FA user saat aktivasi 2FA
 * 
 * @param {number} userId User ID
 * @param {string} email User Email
 */
export async function activate2FA(id, email) {
    return db("users")
        .where({
            id,
            email
        })
        .update({
            is_2fa_active: true
        });
}

/**
 * Update last login user
 * 
 * @param {number} userId User ID
 * @param {string} datetime Tanggal login
 */
export async function updateLastLogin(userId, datetime) {
    return db("users")
        .where({
            id: userId
        })
        .update("last_login", datetime);
}