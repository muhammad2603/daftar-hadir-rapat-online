import { getCredentials } from "../models/UsersModel.js";
import bcrypt from 'bcrypt';
import { checkIsUserHasLoggedIn } from "../middlewares/auth.js";

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
export async function loginAttempt(usernameReq, passwordReq) {
    const user = await getCredentials(usernameReq);
    if (!user) {
        const error = new Error("Username atau password salah!");
        error.status = 401;
        throw error;
    }
    /*
     * // TODO (FINGERPRINT VALIDATION - 1)
     * Cek apakah pengguna login sebagai trusted? contoh yang dicurigai adalah ketika:
     * 1. Login dari IP yang berbeda secara tiba-tiba.
     * 2. Perangkat yang berbeda.
     * 
     * Gunakan FingerprintJS untuk menyimpan identitas fisik pengguna seperti perangkat.
     */
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

/**
 * Melakukan validasi apakah pengguna sudah login
 * 
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * 
 * @returns {void}
 * Pengguna akan diarahkan ke Dashboard jika telah login
 */
export function isLoggedIn(req, res, next) {
    const isUserHasLoggedIn = checkIsUserHasLoggedIn(req).loggedIn;
    if (isUserHasLoggedIn) {
        return res.redirect(301, '/dashboard');
    }
    next();
}