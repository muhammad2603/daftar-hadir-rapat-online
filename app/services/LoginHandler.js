import { getCredentials } from "../models/UsersModel.js";
import bcrypt from 'bcrypt';

/**
 * Melakukan percobaan login
 * 
 * @param {string} username
 * 
 * @returns {Promise<{ userId: number, username: string, password: string, isValid: boolean }>}
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
    const { id, password } = user;
    const isValidPassword = await bcrypt.compare(passwordReq, password);
    if (!isValidPassword) {
        const error = new Error("Username atau password salah!");
        error.status = 401;
        throw error;
    }
    return {
        userId: id,
        isValid: isValidPassword
    };
}

export {
    loginAttempt,
};