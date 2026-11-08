import * as SesiRapatModel from "../models/SesiRapatModel.js";
import { DateTimeParser } from "../services/DateTimeParser.js";

const STATE = {
    INPROGRESS: "Sedang Berlangsung",
    COMPLETED: "Selesai",
}

/**
 * Menyiapkan baris sesi rapat untuk view dengan parsing tanggal dan waktu
 */
const toMeetingView = (row) => ({
    ...row,
    waktu_presensi_dimulai: row.waktu_presensi_dimulai.slice(0, 5),
    created_at: DateTimeParser(row.created_at).toLocalizedString("dd MMMM yyyy"),
});

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
        inProgress: await SesiRapatModel.getTotalMeetingsSessionByState(STATE.INPROGRESS),
        completed: await SesiRapatModel.getTotalMeetingsSessionByState("Selesai"),
        currentDay: await SesiRapatModel.getTotalMeetingsSessionCurrDay(),
    };
}

/**
 * Mengambil highlight semua rapat kecuali yang telah selesai
 */
export const getAllHighlightMeetingsIsNotCompleted = async () => {
    const meetings = await SesiRapatModel.getAllMeetingsHighlightWithoutCompleted();
    return meetings.map(toMeetingView);
}

/**
 * Mengambil highlight rapat yang sedang berlangsung hari ini
 */
export const getHighlightMeetingsInProgressCurrDay = async () => {
    const meetings = await SesiRapatModel.getMeetingsHighlight("current", STATE.INPROGRESS);
    return meetings.map(toMeetingView);
}

/**
 * Mengambil highlight rapat beserta total sesi kehadiran peserta
 */
export const getHighlightMeetingsWithParticipants = async () => {
    const [inProgress, completed] = await Promise.all([
        await SesiRapatModel.getMeetingsHighlight("current", STATE.INPROGRESS, true),
        await SesiRapatModel.getMeetingsHighlight(false, STATE.COMPLETED, true),
    ]);
    return {
        meetingsInProgress: inProgress.map(toMeetingView),
        meetingsCompleted: completed.map(toMeetingView),
    };
}