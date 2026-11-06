import { getCredentials } from "../models/UsersModel.js";
import bcrypt from 'bcrypt';
import { checkIsUserHasLoggedIn } from "../middlewares/auth.js";
import { ERR } from "../error_handlers/ErrorCodes.js";
import { HttpError } from "../error_handlers/HttpError.js";

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
        throw new HttpError(401, "Username atau password salah!", ERR.INVALID_CREDENTIALS);
    }
    const { id, password, email, role, is_2fa_active } = user;
    const isValidPassword = await bcrypt.compare(passwordReq, password);
    if (!isValidPassword) {
        throw new HttpError(401, "Username atau password salah!", ERR.INVALID_CREDENTIALS);
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
        return res.redirect(302, '/dashboard');
    }
    next();
}