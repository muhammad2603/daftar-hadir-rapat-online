/**
 * State sesi rapat
 * 
 * @typedef {"Belum Dimulai" | "Sedang Berlangsung" | "Selesai"} StatesMeetingOptions
 */

/**
 * @typedef {Object[]} MeetingsHighlightReturn
 * 
 * @property {number} id
 * @property {string} judul
 * @property {string} agenda
 * @property {string} ruang
 * @property {string} waktu_presensi_dimulai
 * @property {string} slug
 * @property {Date} created_at Waktu rapat dibuat/disimpan direcord database
 * @property {number} total_kehadiran
 */

/**
 * @typedef {Object[]} AllMeetingsHighlightReturn
 * 
 * @property {number} id
 * @property {string} judul
 * @property {string} agenda
 * @property {string} ruang
 * @property {string} waktu_presensi_dimulai
 * @property {string} slug
 * @property {string} state
 * @property {Date} created_at Waktu rapat dibuat/disimpan direcord database
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
 * @returns {Promise<MeetingsHighlightReturn>}
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
 * @returns {Promise<AllMeetingsHighlightReturn>}
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