/**
 * State sesi rapat
 * 
 * @typedef {"Belum Dimulai" | "Sedang Berlangsung" | "Selesai"} StatesMeetingOptions
 */

import db from "../config/config.db.js";
import { DateTimeParser } from "../services/DateTimeParser.js";

const TABLE = "sesi_rapat";

/**
 * Mengambil seluruh total sesi rapat
 * 
 * @returns {Promise<number>}
 */
export const getTotalMeetingsSession = async () => {
    const getTotal = await db(TABLE)
        .count("id AS total")
        .first();
    return getTotal.total;
}

/**
 * Mengambil seluruh total sesi rapat berdasarkan state
 * 
 * @param {StatesMeetingOptions} state
 * 
 * @returns {Promise<number>}
 */
export const getTotalMeetingsSessionByState = async (state) => {
    const getTotal = await db(TABLE)
        .where("state", state)
        .count("id AS total_state")
        .first();
    return getTotal.total_state;
}

/**
 * Mengambil seluruh total sesi "hari ini"
 * 
 * @returns {Promise<number>}
 */
export const getTotalMeetingsSessionCurrDay = async () => {
    const currDate = DateTimeParser(new Date()).toLocalizedString("yyyy-MM-dd");
    const getTotalCurrDate = await db(TABLE)
        .select()
        .where("tanggal", currDate)
        .count("id AS total_current_day")
        .first();
    return getTotalCurrDate.total_current_day;
}

/**
 * Mengambil highlights sesi rapat.
 * 
 * @param {string} [date]
 * Cari berdasarkan tanggal rapat dengan format "tahun-bulan-tanggal". Set `false` jika tidak ingin mencari berdasarkan tanggal. Set `current` jika ingin mencari berdasarkan tanggal saat ini.
 * @param {StatesMeetingOptions} [state] Cari berdasarkan state rapat, default `false`.
 * 
 * @returns {Promise<Object[]>}
 */
export const getMeetingsHighlight = async (date = false, state = false, withParticipants = false) => {
    let byDate;
    if (date === "current") {
        byDate = DateTimeParser(new Date()).toLocalizedString("yyyy-MM-dd");
    } else if (date !== false) {
        byDate = date;
    }
    const builder = db(TABLE)
        .select([
            "sesi_rapat.id",
            "judul",
            "agenda",
            "ruang",
            "waktu_presensi_dimulai",
            "slug",
            "state",
            "created_at",
        ])
        .orderBy("tanggal", "desc")
        .orderBy("id", "desc");
    if (date !== false) {
        builder.where("tanggal", byDate);
    }
    if (state !== false) {
        builder.where("state", state);
    }
    if (withParticipants) {
        builder.select(
            db("sesi_rapat_kehadiran")
                .whereRaw("sesi_rapat_kehadiran.sesi_rapat_id = sesi_rapat.id")
                .count("*")
                .as("total_kehadiran")
        );
    }
    return await builder;
}

/**
 * Mengambil semua highlight rapat kecuali yang telah selesai
 * 
 * @param {string} [date]
 * Cari berdasarkan tanggal rapat, default `false`. Format "tahun-bulan-tanggal".
 * 
 * @returns {Promise<Object[]>}
 */
export const getAllMeetingsHighlightWithoutCompleted = async (date = false) => {
    let byDate;
    if (date === false) {
        byDate = DateTimeParser(new Date()).toLocalizedString("yyyy-MM-dd");
    } else {
        byDate = date;
    }
    return db(TABLE)
        .select([
            "id",
            "judul",
            "agenda",
            "ruang",
            "waktu_presensi_dimulai",
            "slug",
            "state",
            "created_at"
        ])
        .whereNot("state", "Selesai")
        .orderBy("id", "desc")
        .orderBy("created_at", "desc")
}

/**
 * Mengambil total sesi rapat yang telah selesai
 */
export const getTotalMeetingsSessionCompleted = async () => {
    const getTotal = await db(TABLE)
        .where("state", "Selesai")
        .count("id as total_completed")
        .first();
    return getTotal.total_completed;
}

/**
 * Mengambil sesi rapat yang telah selesai beserta total kehadiran peserta
 */
export const getMeetingsCompletedWithParticipants = async () => {
    return db(TABLE)
        .select(
            "sesi_rapat.*",
            db("sesi_rapat_kehadiran")
                .whereRaw("sesi_rapat.id = sesi_rapat_kehadiran.sesi_rapat_id")
                .count("*")
                .as("total_kehadiran"),
        )
        .where("sesi_rapat.state", "Selesai");
}