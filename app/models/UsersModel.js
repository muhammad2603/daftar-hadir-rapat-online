import knex from 'knex';
import KnexConfig from '../../knexfile.js';
import 'dotenv/config';

const environment = process.env.APP_ENV || 'production';
const config = KnexConfig[environment];

const db = knex(config);

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
async function getCredentials(username) {
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

export {
    getCredentials,
};