import { doubleCsrf } from "csrf-csrf";
import 'dotenv/config';

const CSRF_TOKEN_SECRET = process.env.CSRF_TOKEN_SECRET;
const isProduction = process.env.APP_ENV === 'production';

const { doubleCsrfProtection, generateCsrfToken } = doubleCsrf({
    getSecret: (req) => CSRF_TOKEN_SECRET,
    cookieName: isProduction ? "__Host-ps.x-csrf-token" : 'ps.x-csrf-token',
    cookieOptions: {
        httpOnly: true,
        sameSite: 'strict',
        secure: isProduction,
    },
    getSessionIdentifier: (req) => {
        return '';
    },
    getCsrfTokenFromRequest: (req) => req.headers["x-csrf-token"],
});

export { doubleCsrfProtection, generateCsrfToken };