import { Router } from "express";
import sharp from "sharp";
import { getSVG } from "qreator/lib/svg";

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

router.get("/api/meetings/:meetingId/qr-code", (req, res) => {
    /**
     * // TODO Validasi apakah meeting id pada uri adalah number? gunakan fungsi bawaan JS isNaN.
     * // TODO Validasi apakah meeting dengan id yang ada di-uri ada direcord?
     * // TODO Jika ada, ambil slug-nya untuk membuat QR Code tautan ke-daftar kehadiran
     */
    const { meetingId } = req.params;
    try {
        const url = "https://localhost:3000/daftar-kehadiran/abc-def";
        const qrSvg = getSVG(url);
        res.type("svg").send(qrSvg);
    } catch (error) {
        res.status(500).send("Terjadi kesalahan saat membuat QR Code!");
    }
});

export default router;