/** Cek autentikasi */
const requireAuth = (req, res, next) => {
    if (!req.body.user) return res.status(401).json({ error: "Belum login!" });
    next();
};

export {
    requireAuth,
};