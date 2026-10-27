import { COOKIE_NAME, verifyToken } from "../services/JWT.js";

/** Cek autentikasi */
const requireAuth = (req, res, next) => {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) return res.status(401).json({ error: "Belum login!" });

    try {
        const payload = verifyToken(token);
        req.user = { id: Number(payload.sub) };
        next();
    } catch (err) {
        res.status(401).json({ error: "Sesi tidak valid atau sudah berakhir!" });
    }
};

export {
    requireAuth,
};