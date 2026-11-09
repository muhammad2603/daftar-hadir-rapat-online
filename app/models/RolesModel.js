import db from "../config/config.db.js";

const TABLE = 'roles';

/**
 * Mengambil semua role
 * 
 * @returns {Promise<[{
 *  id: number,
 *  nama: string,
 * }]>}
 */
export const getAllRole = async () => {
    return await db(TABLE)
        .select("*");
}