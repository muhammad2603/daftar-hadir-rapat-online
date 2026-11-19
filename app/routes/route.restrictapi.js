import * as crypto from 'node:crypto';
import path from 'node:path';
import * as fs from 'node:fs';
import { Router } from "express";
import multer from 'multer';
import { isValid } from 'date-fns';
import { DateTimeParser } from '../services/DateTimeParser.js';
import { HttpError } from '../error_handlers/HttpError.js';
import { ERR } from '../error_handlers/ErrorCodes.js';
import db from '../config/config.db.js';

const router = Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/kop-surat');
    },
    filename: (req, file, cb) => {
        const uniqueName = crypto.randomBytes(16).toString('hex');
        const basename = path.basename(file.originalname);
        const extension = path.extname(basename).toLowerCase();
        cb(null, `${uniqueName}${extension}`);
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

router.post("/api/meeting/save", upload.single("fileKop"), async (req, res) => {
    const reqBody = req.body;
    if (!reqBody) {
        throw new HttpError(400, "Terjadi kesalahan saat menyimpan sesi rapat!", ERR.BAD_REQUEST);
    }
    let { judul, tanggal, ruang } = reqBody;
    let agenda = reqBody.agenda ?? null;
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
            const isKopDefaultExist = fs.existsSync(`${KOP_UPLOAD_PATH}/${KOP_DEFAULT_FILENAME}`);
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
                agenda,
                pimpinan_rapat: "Fattahillah",
                ruang,
                tanggal,
                file_kop_surat: fileKop ? req.file.filename : KOP_DEFAULT_PATH,
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

export default router;