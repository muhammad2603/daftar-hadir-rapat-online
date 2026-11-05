import express from 'express';
import cookieParser from 'cookie-parser';
import { requireFullAuth } from './app/middlewares/auth.js';
import daftarKehadiranRoute from './app/routes/route.daftarkehadiran.js';
import APIRoute from './app/routes/route.api.js';
import activateTwoFactor from './app/routes/route.activatetwofactor.js';
import verifyTwoFactor from './app/routes/route.verifytwofactor.js';
import resendTwoFactor from './app/routes/route.resendtwofactor.js';
import login from './app/routes/route.login.js';
import logout from './app/routes/route.logout.js';
import dashboardRoute from './app/routes/route.dashboard.js';
import { doubleCsrfProtection } from './app/middlewares/csrfToken.js';
import { generateCsrf } from './app/middlewares/generateCsrf.js';
import 'dotenv/config';
import { HttpError } from './app/error_handlers/HttpError.js';

const app = express();
const hostname = 'localhost';
const port = Number(process.env.APP_PORT || 3000);
if (process.env.APP_ENV === 'production') {
    app.set('trust proxy', 1);
}
const COOKIE_SECRET = process.env.COOKIE_SECRET;

app.set("view engine", "ejs");
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser(COOKIE_SECRET));
app.use(doubleCsrfProtection);
app.use(generateCsrf);

app.use(daftarKehadiranRoute);
app.use(login);
app.use(APIRoute);
app.use(activateTwoFactor);
app.use(verifyTwoFactor);
app.use(resendTwoFactor);
app.use(requireFullAuth);
app.use(dashboardRoute);
app.use(logout);

app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);
    if (err.code === 'EBADCSRFTOKEN') {
        return res.status(403).json({ error: "Token CSRF tidak valid atau telah kedaluwarsa! Silakan muat ulang halaman." });
    }
    const status = Number(err.status);
    if (err instanceof HttpError || (status >= 400 && status < 500 && err.expose !== false)) {
        if (err.retryAfter) res.set('Retry-After', String(err.retryAfter));
        return res.status(err.status).json({ error: err.message });
    }
    console.error("ErrCode:", err.code);
    console.error(err.stack);
    return res.status(500).json({ error: "Terjadi kesalahan pada server." });
});

app.listen(port, hostname, () => {
    console.log(`Server listening on http://${hostname}:${port}`);
});