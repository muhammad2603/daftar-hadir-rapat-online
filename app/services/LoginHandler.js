import { getCredentials } from "../models/UsersModel.js";
import bcrypt from 'bcrypt';

/**
 * Melakukan percobaan login
 * 
 * @param {string} username
 * 
 * @returns {Promise<{ username: string, password: string }>}
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
    const { username, password } = user;
    const isValidPassword = await bcrypt.compare(passwordReq, password);
    if (!isValidPassword) {
        const error = new Error("Username atau password salah!");
        error.status = 401;
        throw error;
    }
    return {
        username,
        password,
        is_valid: isValidPassword
    };
}

export {
    loginAttempt,
};