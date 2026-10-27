import jwt from 'jsonwebtoken';
import 'dotenv/config';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw Error("JWT Secret belum diatur di .env!");

const TTL_SECONDS = Number(process.env.JWT_TTL_SECONDS ?? 3600);

export const COOKIE_NAME = 'token';

const cookieOptions = {
    httpOnly: true,
    secure: process.env.APP_ENV === 'production',
    sameSite: 'lax',
    path: '/'
};

/**
 * Membuat Token JWT
 * 
 * @param {{ id: number }} user
 * 
 * @returns {string}
 */
export function signToken(user) {
    return jwt.sign({ sub: String(user.id) }, JWT_SECRET, {
        algorithm: 'HS256',
        expiresIn: TTL_SECONDS,
    });
}

/**
 * Verifikasi Token JWT
 * 
 * @param {string} token
 * 
 * @returns {import('jsonwebtoken').JwtPayload}
 * Melempar error jika token tidak valid/kedaluwarsa
 */
export function verifyToken(token) {
    return jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] });
}

export function setAuthCookie(res, token) {
    res.cookie(COOKIE_NAME, token, {
        ...cookieOptions,
        // Perkalian dibutuhkan karena JavaScript menggunakan milidetik (MS)
        maxAge: TTL_SECONDS * 1000,
    });
}

export function clearAuthCookie(res) {
    res.clearCookie(COOKIE_NAME, cookieOptions);
}