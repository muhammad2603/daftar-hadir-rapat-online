import db from "../config/config.db.js";

const TABLE = "sesi_rapat_kehadiran";

/**
 * Mengambil total kehadiran disesi rapat yang telah selesai
 */
export const getTotalPresencesOnMeetingsCompleted = async () => {
    const getCounts = await db(TABLE)
        .where("sesi_rapat.state", "Selesai")
        .join("sesi_rapat", "sesi_rapat.id", "=", "sesi_rapat_kehadiran.sesi_rapat_id")
        .count("sesi_rapat_id as total_semua_kehadiran")
        .first();
    return getCounts.total_semua_kehadiran;
}