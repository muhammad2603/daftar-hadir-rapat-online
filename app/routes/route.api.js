import { Router } from "express";
import sharp from "sharp";
import { getSVG } from "qreator/lib/svg";
import path from 'node:path';
import 'dotenv/config';

const router = Router();

// __COMMENT__ Route ini digunakan untuk menyimpan daftar kehadiran peserta
router.post("/api/meetings/:meetingId/attendances", async (req, res) => {
    res.setHeader("Content-Type", 'text/html');
    try {
        // TODO Ambil data pengguna yang dikirim dari form daftar kehadiran
        const { meetingId } = req.params;
        // Base64 encode tidak membawa "data:image/*;base64,", hapus jika base64 yang terkirim membawa string tersebut
        const signatureBase64 = "{Base64 Encode}";
        const imageBuffer = Buffer.from(signatureBase64, 'base64');
        await sharp(imageBuffer)
            .trim({
                background: 'rgba(0,0,0,0)',
                threshold: 0
            })
            .png()
            .toFile('storage/signatures/signature.png');
        res.send("Signature berhasil tersimpan. Cek file signature.png difolder storage/signatures!");
    } catch (error) {
        res.send("Gagal menyimpan gambar Signature! ;( Cek konfigurasi Sharp Anda!");
    }
});

/**
 * Route endpoint untuk generate QR Code link kehadiran
 */
router.get("/api/meetings/qr-presence/:meetingSlug", (req, res) => {
    const { meetingSlug } = req.params;
    try {
        let baseUrl = process.env.SITE_URL;
        const url = new URL(`/daftar-kehadiran/${encodeURIComponent(meetingSlug)}`, baseUrl).href;
        const qrSvg = getSVG(url);
        res.type("svg").send(qrSvg);
    } catch (error) {
        res.status(500).send("Terjadi kesalahan saat membuat QR Code!");
    }
});

export default router;