import { Router } from "express";

const router = Router();

// __FIX__ Ganti uri abc-def menjadi :meetingSlug
router.get("/daftar-kehadiran/abc-def", (req, res) => {
    // TODO Validasi apakah :meetingSlug tersedia dan sesi kehadiran terbuka?
    // TODO Jika meeting ada dan sesi kehadiran dibuka, simpan slug id (bukan slug) agar submit form membawa id-nya.
    res.render("frontend/daftar_kehadiran", {
        title: "Formulir Daftar Kehadiran"
    });
});

export default router;