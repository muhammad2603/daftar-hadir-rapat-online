import { Router } from "express";
import { loginAttempt } from "../services/LoginHandler.js";
import 'dotenv/config';

const router = Router();

router.get("/", (_, res) => {
    res.render("frontend/login", {
        title: process.env.SITE_TITLE
    });
});

router.post("/login", async (req, res) => {
    try {
        const body = req.body ?? {};
        if (!body.username || !body.password) {
            const error = new Error("Username atau password salah!");
            error.status = 401;
            throw error;
        }
        const { username, password } = body;
        const attempt = await loginAttempt(username, password);
        return res.json(attempt);
    } catch (err) {
        if (err.status) {
            return res.status(err.status).json({ message: err.message });
        }
    }
});

export default router;