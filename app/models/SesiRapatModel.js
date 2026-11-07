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
 * @param {"Belum Dimulai" | "Sedang Berlangsung" | "Selesai"} state
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
