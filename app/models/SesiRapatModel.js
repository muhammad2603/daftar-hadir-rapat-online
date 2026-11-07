/**
 * State sesi rapat
 * 
 * @typedef {"Belum Dimulai" | "Sedang Berlangsung" | "Selesai"} StatesMeetingOptions
 */

/**
 * @typedef {Object[]} MeetingsHighlightReturn
 * 
 * @property {string} judul
 * @property {string} agenda
 * @property {string} ruang
 * @property {string} waktu_presensi_dimulai
 * @property {Date} created_at Waktu rapat dibuat/disimpan direcord database
 */

import db from "../config/config.db.js";

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
    const currDate = new Date().toLocaleDateString("sv-SE", { timezone: "Asia/Jakarta" });
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
 * Cari berdasarkan tanggal rapat, default `false`. Format "tahun-bulan-tanggal".
 * @param {StatesMeetingOptions} [state] Cari berdasarkan state rapat, default `false`.
 * 
 * @returns {Promise<MeetingsHighlightReturn>}
 */
export const getMeetingsHighlight = async (date = false, state = false) => {
    let byDate;
    if (date === false) {
        byDate = new Date().toLocaleDateString("sv-SE", { timezone: "Asia/Jakarta" });
    } else {
        byDate = date;
    }
    const builder = db(TABLE)
        .select([
            "judul",
            "agenda",
            "ruang",
            "waktu_presensi_dimulai",
            "created_at"
        ])
        .where("tanggal", byDate);
    if (state !== false) {
        builder.where("state", state);
    }
    return await builder;
}