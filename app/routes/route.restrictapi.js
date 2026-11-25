import * as crypto from 'node:crypto';
import path from 'node:path';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import { Router } from "express";
import multer from 'multer';
import { isValid } from 'date-fns';
import { DateTimeParser } from '../services/DateTimeParser.js';
import { HttpError } from '../error_handlers/HttpError.js';
import { ERR } from '../error_handlers/ErrorCodes.js';
import db from '../config/config.db.js';
import { getListParticipants } from '../models/SesiRapatKehadiranModel.js';

const router = Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/kop-surat');
    },
    filename: (req, file, cb) => {
        const filename = req.body.isDefault ?? false;
        if (filename !== false) {
            const uniqueName = crypto.randomBytes(16).toString('hex');
            const basename = path.basename(file.originalname);
            const extension = path.extname(basename).toLowerCase();
            cb(null, `${uniqueName}${extension}`);
        } else {
            cb(null, "default.jpg");
        }
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpg|jpeg|png/;
        const basename = path.basename(file.originalname);
        const fileExtension = path.extname(basename).toLowerCase();
        const isExtValid = allowedTypes.test(fileExtension);
        const isMimeValid = allowedTypes.test(file.mimetype);
        if (isExtValid && isMimeValid) {
            return cb(null, true);
        }
        cb(new HttpError(422, "Format file tidak diizinkan.", 422));
    }
});

/**
 * Mengubah string menjadi format yang ramah url
 * 
 * @param {string} str
 * @param {string} [separator] Pemisah antar kalimat string
 * @param {boolean} [lowercase]
 */
const urlTitle = (str, separator = '-', lowercase = false) => {
    if (!str) return '';
    const sep = separator === '_' ? '_' : '-';
    const escapedSep = sep === '-' ? '\\-' : '_';
    let result = String(str)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9\s\-_]/g, '')
        .replace(/[\s\-_]+/g, sep)
        .replace(new RegExp(`^${escapedSep}+|${escapedSep}+$`, 'g'), '');
    return lowercase ? result.toLowerCase() : result;
}

/**
 * Mengganti karakter Non-ASCII pada string
 * 
 * @param {Intl.Segmenter} segmenter
 * @param {string} str
 * @param {string} [replacedAs]
 */
function replaceNonAscii(segmenter, str, replacedAs = "") {
    const segments = Array.from(segmenter.segment(str), s => s.segment);
    const regex = /^[\x00-\x7F]$/;
    return segments
        .map(char => (regex.test(char) ? char : replacedAs))
        .join('')
        .trim();
}

const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });

const KOP_UPLOAD_PATH = 'public/uploads/kop-surat';
const KOP_DEFAULT_FILENAME = 'default.jpg';

/**
 * API untuk menyimpan sesi rapat
 */
router.post("/api/meeting/save", upload.single("fileKop"), async (req, res) => {
    const reqBody = req.body;
    if (!reqBody) {
        throw new HttpError(400, "Terjadi kesalahan saat menyimpan sesi rapat!", ERR.BAD_REQUEST);
    }
    let { judul, tanggal, ruang } = reqBody;
    let agenda = reqBody.agenda;
    const fileKop = req.file ?? null;
    let tanggalToDate = new Date(tanggal);

    try {
        if (!judul || judul === '') {
            throw new HttpError(400, "Input tidak boleh kosong.", ERR.BAD_REQUEST, { inputError: "judul" });
        }
        const judulLength = judul.length;
        const isInvalidJudulLength = (judulLength < 15 || judulLength > 60);
        if (isInvalidJudulLength) {
            throw new HttpError(400, "Panjang input tidak boleh kurang dari 15 karakter dan tidak lebih dari 60 karakter.", ERR.BAD_REQUEST, { inputError: "judul" });
        }
        const isJudulInvalid = /[^A-Za-z\d\-\/\(\)\s]/.test(judul);
        if (isJudulInvalid) {
            throw new HttpError(400, "Input hanya mengandung huruf, angka, garis miring, tanda -, dan tanda kurung.", ERR.BAD_REQUEST, { inputError: "judul" });
        }
        if (!tanggal || tanggal === '') {
            throw new HttpError(400, "Mohon tentukan tanggal rapat.", ERR.BAD_REQUEST, { inputError: "tanggal" });
        }
        if (!isValid(tanggalToDate)) {
            throw new HttpError(400, "Tanggal rapat tidak valid. Pastikan tanggal dalam format yang benar!", ERR.BAD_REQUEST, { inputError: "tanggal" });
        }
        tanggalToDate = tanggalToDate.setHours(0, 0, 0);
        const currDate = new Date().setHours(0, 0, 0);
        if (tanggalToDate > currDate) {
            throw new HttpError(400, `Tanggal rapat tidak boleh lebih dari tanggal saat ini.`, ERR.BAD_REQUEST, { inputError: "tanggal" });
        }
        if (!ruang || ruang === '') {
            throw new HttpError(400, "Input tidak boleh kosong.", { inputError: "ruang" });
        }
        const ruangLength = ruang.length;
        const isInvalidRuangLength = (ruangLength < 3 || ruangLength > 50);
        if (isInvalidRuangLength) {
            throw new HttpError(400, "Panjang input tidak boleh kurang dari 3 karakter dan tidak lebih dari 50 karakter.", { inputError: "ruang" });
        }
        const isRuangInvalid = /[^A-Za-z\d\-\/\(\)\s.]/.test(ruang);
        if (isRuangInvalid) {
            throw new HttpError(400, "Input hanya boleh mengandung huruf, angka, garis miring, tanda -, tanda kurung, dan titik.", { inputError: "ruang" });
        }
        const agendaLength = agenda.length;
        const isAgendaFilled = agendaLength > 0;
        const isAgendaInvalidLength = (agendaLength < 15 || agendaLength > 255);
        if (
            isAgendaFilled &&
            isAgendaInvalidLength
        ) {
            throw new HttpError(400, "Panjang input tidak boleh kurang dari 15 karakter dan tidak lebih dari 255 karakter.", { inputError: "agenda" });
        }
        if (fileKop === null) {
            const isKopDefaultExist = existsSync(`${KOP_UPLOAD_PATH}/${KOP_DEFAULT_FILENAME}`);
            if (!isKopDefaultExist) {
                throw new HttpError(400, "Kop default belum ditambahkan. Mohon upload kop secara manual!", ERR.BAD_REQUEST, { inputError: "fileKop" });
            }
        }
    } catch (err) {
        const { message: error, appCode: code, inputError } = err;
        return res.status(err.status).json({
            error,
            code,
            inputError
        });
    }
    const slug_kehadiran = crypto.randomUUID();
    const slug = urlTitle(judul, '-', true);
    judul = replaceNonAscii(segmenter, judul);
    tanggal = DateTimeParser(tanggalToDate).toLocalizedString("yyyy-MM-dd");
    ruang = replaceNonAscii(segmenter, ruang);
    agenda = replaceNonAscii(segmenter, agenda);
    try {
        const userId = req.user.id;
        const createdAt = new Date();
        const [insertedId] = await db.table("sesi_rapat")
            .insert({
                judul,
                agenda: req.body.agenda ? agenda : null,
                ruang,
                tanggal,
                file_kop_surat: fileKop ? req.file.filename : KOP_DEFAULT_FILENAME,
                slug_kehadiran,
                slug,
                created_by: userId,
                created_at: createdAt,
            });
        await db.table("user_activities")
            .insert({
                user_id: userId,
                ref_table: "sesi_rapat",
                ref_value: insertedId,
                operasi: "insert",
                recorded_at: createdAt
            });
        return res.status(201).send();
    } catch (error) {
        throw error;
    }
});

/**
 * API untuk mengedit sesi rapat
 */
router.put("/api/meeting/:sessionId", upload.single("fileKop"), async (req, res) => {
    const reqBody = req.body;
    if (!reqBody) {
        throw new HttpError(400, "Terjadi kesalahan saat menyimpan sesi rapat!", ERR.BAD_REQUEST);
    }
    const { sessionId } = req.params;
    let { judul, tanggal, ruang } = reqBody;
    let agenda = reqBody.agenda;
    const fileKop = req.file ?? null;
    let tanggalToDate = new Date(tanggal);

    try {
        if (!judul || judul === '') {
            throw new HttpError(400, "Input tidak boleh kosong.", ERR.BAD_REQUEST, { inputError: "judul" });
        }
        const judulLength = judul.length;
        const isInvalidJudulLength = (judulLength < 15 || judulLength > 60);
        if (isInvalidJudulLength) {
            throw new HttpError(400, "Panjang input tidak boleh kurang dari 15 karakter dan tidak lebih dari 60 karakter.", ERR.BAD_REQUEST, { inputError: "judul" });
        }
        const isJudulInvalid = /[^A-Za-z\d\-\/\(\)\s]/.test(judul);
        if (isJudulInvalid) {
            throw new HttpError(400, "Input hanya mengandung huruf, angka, garis miring, tanda -, dan tanda kurung.", ERR.BAD_REQUEST, { inputError: "judul" });
        }
        if (!tanggal || tanggal === '') {
            throw new HttpError(400, "Mohon tentukan tanggal rapat.", ERR.BAD_REQUEST, { inputError: "tanggal" });
        }
        if (!isValid(tanggalToDate)) {
            throw new HttpError(400, "Tanggal rapat tidak valid. Pastikan tanggal dalam format yang benar!", ERR.BAD_REQUEST, { inputError: "tanggal" });
        }
        tanggalToDate = tanggalToDate.setHours(0, 0, 0);
        const currDate = new Date().setHours(0, 0, 0);
        if (tanggalToDate > currDate) {
            throw new HttpError(400, `Tanggal rapat tidak boleh lebih dari tanggal saat ini.`, ERR.BAD_REQUEST, { inputError: "tanggal" });
        }
        if (!ruang || ruang === '') {
            throw new HttpError(400, "Input tidak boleh kosong.", { inputError: "ruang" });
        }
        const ruangLength = ruang.length;
        const isInvalidRuangLength = (ruangLength < 3 || ruangLength > 50);
        if (isInvalidRuangLength) {
            throw new HttpError(400, "Panjang input tidak boleh kurang dari 3 karakter dan tidak lebih dari 50 karakter.", { inputError: "ruang" });
        }
        const isRuangInvalid = /[^A-Za-z\d\-\/\(\)\s.]/.test(ruang);
        if (isRuangInvalid) {
            throw new HttpError(400, "Input hanya boleh mengandung huruf, angka, garis miring, tanda -, tanda kurung, dan titik.", { inputError: "ruang" });
        }
        const agendaLength = agenda.length;
        const isAgendaFilled = agendaLength > 0;
        const isAgendaInvalidLength = (agendaLength < 15 || agendaLength > 255);
        if (
            isAgendaFilled &&
            isAgendaInvalidLength
        ) {
            throw new HttpError(400, "Panjang input tidak boleh kurang dari 15 karakter dan tidak lebih dari 255 karakter.", { inputError: "agenda" });
        }
        if (fileKop === null) {
            const isKopDefaultExist = existsSync(`${KOP_UPLOAD_PATH}/${KOP_DEFAULT_FILENAME}`);
            if (!isKopDefaultExist) {
                throw new HttpError(400, "Kop default belum ditambahkan. Mohon upload kop secara manual!", ERR.BAD_REQUEST, { inputError: "fileKop" });
            }
        }
    } catch (err) {
        const { message: error, appCode: code, inputError } = err;
        return res.status(Number(err.status ?? 400)).json({
            error,
            code,
            inputError
        });
    }
    const slug_kehadiran = crypto.randomUUID();
    const slug = urlTitle(judul, '-', true);
    judul = replaceNonAscii(segmenter, judul);
    tanggal = DateTimeParser(tanggalToDate).toLocalizedString("yyyy-MM-dd");
    ruang = replaceNonAscii(segmenter, ruang);
    agenda = replaceNonAscii(segmenter, agenda);
    try {
        const userId = req.user.id;
        const currDate = new Date();
        await db.table("sesi_rapat")
            .where("id", sessionId)
            .update({
                judul,
                agenda: req.body.agenda ? agenda : null,
                ruang,
                tanggal,
                file_kop_surat: fileKop ? req.file.filename : KOP_DEFAULT_FILENAME,
                slug_kehadiran,
                slug,
                created_by: userId,
                updated_at: currDate,
            });
        await db.table("user_activities")
            .insert({
                user_id: userId,
                ref_table: "sesi_rapat",
                ref_value: sessionId,
                operasi: "update",
                recorded_at: currDate,
            });
        return res.status(201).send();
    } catch (error) {
        throw error;
    }
});

/**
 * API untuk memulai sesi rapat
 */
router.patch("/api/meeting/:sessionId/start-session", upload.none(), async (req, res) => {
    const { sessionId } = req.params;
    try {
        if (!sessionId || isNaN(sessionId)) {
            throw new HttpError(400, "Terjadi kesalahan saat memulai sesi! Silahkan coba lagi.", ERR.BAD_REQUEST);
        }
        const findSession = await db.table("sesi_rapat").where("id", sessionId).first();
        const isSessionExist = (findSession === undefined);
        if (isSessionExist) {
            throw new HttpError(404, "ID sesi rapat tidak ditemukan! Muat ulang halaman dan coba lagi.", ERR.NOT_FOUND);
        }
        if (findSession.state !== "Belum Dimulai") {
            throw new HttpError(400, "Sesi rapat tidak dapat dimulai. Pastikan sesi belum dimulai!", ERR.BAD_REQUEST);
        }
        await db.table("sesi_rapat")
            .where("id", sessionId)
            .update({ state: "Sedang Berlangsung" });
        await db.table("user_activities")
            .insert({
                user_id: req.user.id,
                ref_table: "sesi_rapat",
                ref_value: sessionId,
                operasi: "update"
            });
        return res.json({ ok: true });
    } catch (err) {
        if (err.status) {
            return res.status(err.status).json({ error: err.message });
        }
        res.status(500).json({ error: "Terjadi kesalahan pada server!" });
    }
});

/**
 * API untuk mengakhiri sesi rapat
 */
router.patch("/api/meeting/:sessionId/end-session", upload.none(), async (req, res) => {
    const { sessionId } = req.params;
    try {
        if (!sessionId || isNaN(sessionId)) {
            throw new HttpError(400, "Terjadi kesalahan saat mengakhiri sesi! Silahkan coba lagi.", ERR.BAD_REQUEST);
        }
        const findSession = await db.table("sesi_rapat").where("id", sessionId).first();
        const isSessionExist = (findSession === undefined);
        if (isSessionExist) {
            throw new HttpError(404, "ID sesi rapat tidak ditemukan! Muat ulang halaman dan coba lagi.", ERR.NOT_FOUND);
        }
        if (findSession.state !== "Sedang Berlangsung") {
            throw new HttpError(400, "Sesi rapat tidak sedang berlangsung!", ERR.BAD_REQUEST);
        }
        await db.table("sesi_rapat")
            .where("id", sessionId)
            .update({ state: "Selesai" });
        await db.table("user_activities")
            .insert({
                user_id: req.user.id,
                ref_table: "sesi_rapat",
                ref_value: sessionId,
                operasi: "update"
            });
        return res.json({ ok: true });
    } catch (err) {
        if (err.status) {
            return res.status(err.status).json({ error: err.message });
        }
        res.status(500).json({ error: "Terjadi kesalahan pada server!" });
    }
});

/**
 * API untuk menghapus sesi rapat
 */
router.delete("/api/meeting/:sessionId", upload.none(), async (req, res) => {
    const { sessionId } = req.params;
    try {
        if (!sessionId || isNaN(sessionId)) {
            throw new HttpError(400, "Terjadi kesalahan saat menghapus sesi! Silahkan coba lagi.", ERR.BAD_REQUEST);
        }
        const findSession = await db.table("sesi_rapat").where("id", sessionId).first();
        const isSessionExist = (findSession === undefined);
        if (isSessionExist) {
            throw new HttpError(404, "ID sesi rapat tidak ditemukan! Muat ulang halaman dan coba lagi.", ERR.NOT_FOUND);
        }
        await db.table("sesi_rapat")
            .where("id", sessionId)
            .delete();
        await db.table("user_activities")
            .insert({
                user_id: req.user.id,
                ref_table: "sesi_rapat",
                ref_value: sessionId,
                operasi: "delete"
            });
        return res.json({ ok: true });
    } catch (err) {
        if (err.status) {
            return res.status(err.status).json({ error: err.message });
        }
        res.status(500).json({ error: "Terjadi kesalahan pada server!" });
    }
});

/**
 * API untuk mengambil list peserta rapat
 */
router.get("/api/meeting/:sessionId/participants", async (req, res) => {
    const { sessionId } = req.params;
    try {
        let listParticipants = await getListParticipants(sessionId);
        const totalParticipants = listParticipants.length;
        listParticipants = listParticipants.map((row) => ({
            ...row,
            waktu_kehadiran: DateTimeParser(row.waktu_kehadiran).toLocalizedString("d MMM yyyy, 'Pukul' HH:mm"),
        }));
        return res.json({
            listParticipants,
            totalParticipants,
        });
    } catch (err) {
        res.status(500).json({ error: "Terjadi kesalahan pada server!" });
    }
});

/**
 * API untuk menampilkan gambar tanda tangan peserta.
*/
router.get("/api/meeting/attendance/:attendanceId/signature", async (req, res) => {
    const { attendanceId } = req.params;
    try {
        const getSignature = (await import('../models/SesiRapatKehadiranModel.js')).getSignatureParticipant(attendanceId);
        const signatureFile = path.basename((await getSignature).file_ttd);
        const imageBuffer = await fs.readFile(`storage/signatures/${signatureFile}`);
        return res.type("png").send(imageBuffer);
    } catch (err) {
        if (err.code === "ENOENT") {
            return res.status(404).json({ error: "Signature peserta tidak ditemukan!" });
        }
        res.status(500).json({ error: "Terjadi kesalahan pada server!" });
    }
});

/**
 * API untuk menambahkan/mengubah kop default
 */
router.post("/api/kop-default", upload.single("fileKop"), (req, res) => {
    try {
        return res.json({ ok: true });
    } catch (err) {
        if (err.status) {
            return res.status(Number(err.status ?? 400)).json({ error: err.message });
        }
        res.status(500).json({ error: "Terjadi kesalahan pada server!" });
    }
});

export default router;