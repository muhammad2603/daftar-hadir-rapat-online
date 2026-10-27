import knex from 'knex';
import KnexConfig from '../../knexfile.js';
import 'dotenv/config';

const environment = process.env.APP_ENV || 'production';
const config = KnexConfig[environment];

const db = knex(config);

/**
 * Mengambil kredensial login pengguna
 * 
 * @param {string} username
 * 
 * @returns {Promise<{ id: number, username: string, password: string }>}
 */
async function getCredentials(username) {
    try {
        const user = await db.table("users").first('id', 'username', 'password').where({ username });
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