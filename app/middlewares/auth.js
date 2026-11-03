import { COOKIE_NAME, verifyToken } from "../services/JWT.js";

/**
 * Cek autentikasi pengguna
 * 
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * 
 * @returns {void} Jika pengguna belum login, akan diarahkan ke route form login
 * @throws Melempar response dengan kode status `401`
 */
export const requireAuth = (req, res, next) => {
    const token = req.cookies?.[COOKIE_NAME];
    // __FIX__ Kemungkinan redirect akan menjadi masalah untuk endpoint yang bukan GET, seperti Verify 2FA. Sesuaikan kembali logikanya.
    if (!token) return res.redirect(301, '/');
    try {
        const payload = verifyToken(token);
        const { sub, email, role, twoFactorEnabled, isFullyAuthenticated } = payload;
        req.user = {
            id: Number(sub),
            email,
            role,
            twoFactorEnabled: Boolean(twoFactorEnabled),
            isFullyAuthenticated
        };
        next();
    } catch (err) {
        res.status(401).json({ error: "Sesi tidak valid atau sudah berakhir!" });
    }
};

/**
 * Cek apakah pengguna telah ter-autentikasi secara penuh
 * 
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const requireFullAuth = (req, res, next) => {
    const token = req.cookies?.[COOKIE_NAME];
    // __FIX__ Kemungkinan redirect akan menjadi masalah untuk endpoint yang bukan GET, seperti Verify 2FA. Sesuaikan kembali logikanya.
    if (!token) return res.redirect(301, '/');
    try {
        const payload = verifyToken(token);
        const { sub, email, role, twoFactorEnabled, isFullyAuthenticated } = payload;
        if (isFullyAuthenticated === false) {
            return res.status(401).json({ error: "Anda belum ter-autentikasi secara penuh." });
        }
        req.user = {
            id: Number(sub),
            email,
            role,
            twoFactorEnabled: Boolean(twoFactorEnabled),
            isFullyAuthenticated
        };
        next();
    } catch (err) {
        res.status(401).json({ error: "Sesi tidak valid atau sudah berakhir!" });
    }
}

/**
 * Cek apakah pengguna sudah login
 * 
 * @param {import('express').Request} req
 * 
 * @return {{ loggedIn: boolean }}
 * `true` jika pengguna telah login
 */
export const checkIsUserHasLoggedIn = (req) => {
    try {
        const token = req.cookies?.[COOKIE_NAME];
        verifyToken(token);
        return { loggedIn: true };
    } catch (err) {
        return { loggedIn: false };
    }
}