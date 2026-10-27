import { Router } from "express";
import { clearAuthCookie } from "../services/JWT.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

export default router.post("/logout", requireAuth, (req, res) => {
    clearAuthCookie(res);
    res.json({ ok: true });
});