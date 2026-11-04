import { generateCsrfToken } from "./csrfToken.js";

export const generateCsrf = (req, res, next) => {
    const accept = req.get('accept') || '';
    if (req.method === 'GET' && accept.includes('text/html')) {
        res.locals.csrfToken = generateCsrfToken(req, res, { overwrite: false });
    }
    next();
}