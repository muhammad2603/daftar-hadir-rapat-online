import { generateCsrfToken } from "./csrfToken.js";

export const generateCsrf = (req, res, next) => {
    let token;
    Object.defineProperty(res.locals, 'csrfToken', {
        enumerable: true,
        get() {
            token ??= generateCsrfToken(req, res, { overwrite: false });
            return token;
        },
    });
    next();
}