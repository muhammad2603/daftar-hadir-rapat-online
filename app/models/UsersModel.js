import db from "../config/config.db.js";

const TABLE = "users";

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
 * @returns {Promise<{ id: number, username: string, password: string, email: string, role: string, roleLabel: string, is_2fa_active: boolean }>}
 */
export async function getCredentials(username) {
    try {
        const user = await db.table(TABLE)
            .first('users.id', 'username', 'password', 'email', 'roles.identitas AS role', 'roles.nama AS roleLabel', 'is_2fa_active')
            .innerJoin('roles', 'roles.id', 'users.role_id')
            .where({ username });
        if (user) {
            user.is_2fa_active = boolean(user.is_2fa_active);
        }
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
    return db(TABLE)
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
    return db(TABLE)
        .where({
            id: userId
        })
        .update("last_login", datetime);
}

/**
 * Mengambil list pengguna
 * 
 * @param {number} currUserId User ID yang ditampilkan pertama (akun anda)
 * @param {number | null} limit Batas pengambilan row
 * 
 * @returns {Promise<[{
 *  id: number,
 *  username: string,
 *  email: string | null,
 *  role: string,
 *  last_login: Date | null,
 * }]>}
 */
export async function getUsers(currUserId, limit = null) {
    const qBuilder = db(TABLE)
        .select([
            "users.id",
            "users.username",
            "users.email",
            "roles.identitas AS role",
            "roles.nama AS roleLabel",
            "users.last_login",
        ])
        .join("roles", "roles.id", "users.role_id")
        .orderByRaw("users.id = ? DESC", [currUserId])
        .orderBy("users.id", "asc");
    if (limit !== null) {
        qBuilder.limit(limit);
    }
    return qBuilder;
}

/**
 * Mengambil identitas role pengguna
 * @param {number} userId
 * 
 * @returns {Promise<{ role: string }>}
 */
export async function getRoleIdentityUser(userId) {
    return db(TABLE)
        .select("roles.identitas AS role")
        .join("roles", "roles.id", "users.role_id")
        .where("users.id", userId)
        .first();
}