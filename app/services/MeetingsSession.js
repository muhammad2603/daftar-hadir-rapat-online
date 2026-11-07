import * as SesiRapatModel from "../models/SesiRapatModel.js";

/**
 * Mengambil seluruh total sesi rapat termasuk sesi rapat yang sedang berlangsung, selesai, dan yang dimulai hari ini.
 * 
 * Results:
 * - total: Seluruh total sesi rapat
 * - inProgress: Seluruh total sesi rapat yang sedang berlangsung
 * - completed: Seluruh total sesi rapat yang telah selesai
 * - currentDay: Seluruh total sesi rapat yang dimulai hari ini
 * 
 * @returns {Promise<{
 *  total: number,
 *  inProgress: number,
 *  completed: number,
 *  currentDay: number,
 * }>}
 */
export const getAllTotalMeetingsSession = async () => {
    return {
        total: await SesiRapatModel.getTotalMeetingsSession(),
        inProgress: await SesiRapatModel.getTotalMeetingsSessionByState("Sedang Berlangsung"),
        completed: await SesiRapatModel.getTotalMeetingsSessionByState("Selesai"),
        currentDay: await SesiRapatModel.getTotalMeetingsSessionCurrDay(),
    };
}