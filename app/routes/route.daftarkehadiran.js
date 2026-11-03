import { Router } from "express";

const router = Router();

router.get("/daftar-kehadiran/abc-def", (req, res) => {
    res.render("frontend/daftar_kehadiran", {
        title: "Formulir Daftar Kehadiran"
    });
});

export default router;