import { Router } from "express";
import sharp from "sharp";
import { getSVG } from "qreator/lib/svg";
import db from "../config/config.db.js";
import { randomUUID } from 'node:crypto';
import * as fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from "node:path";
import 'dotenv/config';
import { HttpError } from '../error_handlers/HttpError.js';
import { ERR } from '../error_handlers/ErrorCodes.js';

const router = Router();

const SIGNATURE_DESTINATION = 'storage/signatures';

router.post("/api/meetings/:meetingSlug/attendance", async (req, res) => {
    const { meetingSlug } = req.params;
    const reqBody = req.body ?? undefined;
    if (!meetingSlug || !reqBody) {
        throw new HttpError(400, "Gagal menyimpan kehadiran! Silahkan coba lagi nanti.", ERR.BAD_REQUEST);
    }
    const meeting = await db.table("sesi_rapat").where({ slug_kehadiran: meetingSlug }).first();
    let signatureFilename = null;
    try {
        if (meeting === undefined || meeting.state !== 'Sedang Berlangsung') {
            throw new HttpError(404, "Gagal menyimpan kehadiran! Pastikan rapat tersedia dan absensi masih terbuka.", ERR.NOT_FOUND);
        }
        const {
            namaLengkap,
            nomorHp,
            jabatan,
            opd,
            signature
        } = reqBody;
        if (
            namaLengkap === '' ||
            nomorHp === '' ||
            jabatan === '' ||
            opd === '' ||
            signature === null
        ) {
            throw new HttpError(400, "Data tidak lengkap, pastikan semua data diri telah terisi!", ERR.BAD_REQUEST);
        }
        let signatureDecoded = signature;
        if (signature.startsWith('data:')) {
            if (!signature.startsWith('data:image/png')) {
                throw new HttpError(415, "Terjadi kesalahan dalam menyimpan tanda tangan! Silahkan muat ulang halaman dan coba lagi.", ERR.INVALID_MEDIA_TYPE)
            }
            const [_, decoded] = signature.split(',');
            signatureDecoded = decoded;
        }
        if (signatureDecoded === '') {
            throw new HttpError(400, "Terjadi kesalahan dalam menyimpan tanda tangan! Silahkan coba tanda tangan ulang.", ERR.BAD_REQUEST);
        }
        const signatureBase64 = signatureDecoded;
        const imageBuffer = Buffer.from(signatureBase64, 'base64');
        signatureFilename = `${SIGNATURE_DESTINATION}/${randomUUID()}.png`;
        await sharp(imageBuffer)
            .trim({
                background: 'rgba(0,0,0,0)',
                threshold: 0
            })
            .png()
            .toFile(signatureFilename);
    } catch (err) {
        if (err.status) {
            return res.status(err.status).json({
                error: err.message,
                code: err.appCode
            });
        }
        throw err;
    }
    try {
        await db.transaction(async (trx) => {
            await trx.table("sesi_rapat_kehadiran")
                .insert({
                    sesi_rapat_id: meeting.id,
                    nama_pegawai: reqBody.namaLengkap,
                    nomor_hp: reqBody.nomorHp,
                    jabatan: reqBody.jabatan,
                    nama_opd: reqBody.opd,
                    file_ttd: path.basename(signatureFilename),
                });
        });
    } catch (err) {
        const isSignatureFileExist = existsSync(signatureFilename);
        if (isSignatureFileExist) {
            await fs.unlink(signatureFilename);
        }
        throw new HttpError(400, "Gagal menyimpan kehadiran! Silahkan coba lagi nanti.", ERR.BAD_REQUEST);
    }
    res.status(201).json({ ok: true });
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