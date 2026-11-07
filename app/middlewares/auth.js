import { COOKIE_NAME, verifyToken } from "../services/JWT.js";

/**
 * Fungsi untuk memberikan response dan redirect.
 * 
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {Object} responseError Response tidak akan dikirim jika request berasal dari browser
 * @param {string} redirectTo Lokasi redirect
 * @param {number} [status] HTTP Status Code tidak digunakan jika request berasal dari browser
 */
const setResponseWithRedirect = (req, res, responseError, redirectTo, status = 401) => {
    if (req.get('Accept')?.includes("application/json")) {
        return res.status(status).json(responseError);
    }
    return res.redirect(302, redirectTo);
};

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
    const token = req.signedCookies[COOKIE_NAME];
    if (!token) {
        return setResponseWithRedirect(req, res, { error: "Token tidak valid atau telah kedaluwarsa." }, '/');
    }
    try {
        const payload = verifyToken(token);
        const { sub, username, email, role, twoFactorEnabled, isFullyAuthenticated } = payload;
        req.user = {
            id: Number(sub),
            username,
            email,
            role,
            twoFactorEnabled: Boolean(twoFactorEnabled),
            isFullyAuthenticated
        };
        next();
    } catch (err) {
        return setResponseWithRedirect(req, res, { error: "Sesi tidak valid atau sudah berakhir!" }, '/');
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
    const token = req.signedCookies[COOKIE_NAME];
    if (!token) {
        return setResponseWithRedirect(req, res, { error: "Token tidak valid atau telah kedaluwarsa." }, '/');
    }
    try {
        const payload = verifyToken(token);
        const { sub, username, email, role, twoFactorEnabled, isFullyAuthenticated } = payload;
        if (isFullyAuthenticated === false) {
            throw new Error("Anda belum ter-autentikasi secara penuh.");
        }
        req.user = {
            id: Number(sub),
            username,
            email,
            role,
            twoFactorEnabled: Boolean(twoFactorEnabled),
            isFullyAuthenticated
        };
        next();
    } catch (err) {
        const getErrorMessage = err.message || "Sesi tidak valid atau sudah berakhir!";
        return setResponseWithRedirect(req, res, { error: getErrorMessage }, '/');
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
        const token = req.signedCookies[COOKIE_NAME];
        const { isFullyAuthenticated } = verifyToken(token);
        if (!isFullyAuthenticated) throw new Error();
        return { loggedIn: true };
    } catch (err) {
        return { loggedIn: false };
    }
}