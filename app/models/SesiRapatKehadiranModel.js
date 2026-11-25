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

/**
 * Mengambil list daftar kehadiran peserta berdasarkan id sesi rapat
 * 
 * @param {number} meetingId
 * 
 * @returns {Promise<Object[]>}
 */
export const getListParticipants = async (meetingId) => {
    return db(TABLE)
        .select([
            "id",
            "nama_pegawai",
            "nomor_hp",
            "jabatan",
            "nama_opd",
            "file_ttd",
            "waktu_kehadiran",
        ])
        .where("sesi_rapat_id", meetingId);
}

/**
 * Mengambil file tanda tangan peserta
 * 
 * @param {number} id
 * 
 * @returns {Promise<{ file_ttd: string }>}
 */
export const getSignatureParticipant = async (id) => {
    return await db(TABLE)
        .select("file_ttd")
        .where("id", id)
        .first();
}