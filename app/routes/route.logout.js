import { Router } from "express";
import { clearAuthCookie } from "../services/JWT.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

export default router.post("/auth/logout", requireAuth, (req, res) => {
    clearAuthCookie(res);
    // TODO Hapus cookie lain yang dibuat saat pengguna ter-autentikasi.
    res.json({ ok: true });
});