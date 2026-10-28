import { getCredentials } from "../models/UsersModel.js";
import bcrypt from 'bcrypt';

/**
 * @typedef {Object} UserIdentities
 * 
 * @property {number} id User ID
 * @property {string} email
 * @property {string} role
 * @property {boolean} twoFactorEnabled
 * `true` jika 2FA telah diaktifkan oleh pengguna
 */

/**
 * Melakukan percobaan login
 * 
 * @param {string} username
 * 
 * @returns {Promise<{ user: UserIdentities, isValid: boolean }>}
 * 
 * @throws {Error}
 * Dengan melemparkan status 401 (Kredensial salah).
 */
async function loginAttempt(usernameReq, passwordReq) {
    const user = await getCredentials(usernameReq);
    if (!user) {
        const error = new Error("Username atau password salah!");
        error.status = 401;
        throw error;
    }
    const { id, password, email, role, is_2fa_active } = user;
    const isValidPassword = await bcrypt.compare(passwordReq, password);
    if (!isValidPassword) {
        const error = new Error("Username atau password salah!");
        error.status = 401;
        throw error;
    }
    return {
        user: {
            id,
            email,
            role,
            twoFactorEnabled: is_2fa_active
        },
        isValid: isValidPassword,
    };
}

export {
    loginAttempt,
};