import * as SesiRapatModel from "../models/SesiRapatModel.js";
import * as SesiRapatKehadiranModel from "../models/SesiRapatKehadiranModel.js";
import { DateTimeParser } from "../services/DateTimeParser.js";
import 'dotenv/config';
import { HttpError } from "../error_handlers/HttpError.js";
import { ERR } from "../error_handlers/ErrorCodes.js";

const STATE = {
    INPROGRESS: "Sedang Berlangsung",
    COMPLETED: "Selesai",
}

/**
 * Menyiapkan baris sesi rapat untuk view dengan parsing tanggal dan waktu
 * 
 * @param {Object[]} row
 */
const toMeetingView = (row) => ({
    ...row,
    ...(row.tanggal !== undefined && {
        tanggal: DateTimeParser(row.tanggal).toLocalizedString("dd MMMM yyyy")
    }),
    created_at: DateTimeParser(row.created_at).toLocalizedString("dd MMMM yyyy"),
    ...(row.updated_at !== undefined && {
        updated_at: DateTimeParser(row.updated_at).toLocalizedString("dd MMMM yyyy HH.mm.ss")
    }),
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

/**
 * Menyajikan sesi rapat yang telah selesai beserta sesi kehadiran peserta
 * 
 * @returns {Promise<Object[]>}
 */
export const meetingsCompletedWithPresences = async () => {
    return await Promise.all(
        (await SesiRapatModel.getMeetingsCompletedWithParticipants()).map(row => toMeetingView(row))
    );
}

/**
 * Menyajikan sesi rapat yang sedang berlangsung beserta tautan kehadiran
 * 
 * @returns {Promise<Object[]>}
 */
export const meetingsInProgressWithLinkAttendance = async () => {
    const meetings = await SesiRapatModel.getMeetingsInProgressWithAttendanceLink();
    return meetings.map((row) => ({
        ...row,
        tanggal: DateTimeParser(row.tanggal).toLocalizedString("dd MMMM yyyy"),
        link_kehadiran: new URL(`/daftar-kehadiran/${encodeURIComponent(row.slug_kehadiran)}`, process.env.SITE_URL).href,
    }))
}

/**
 * Menyajikan data sesi rapat berdasarkan slug untuk diedit
 * 
 * @param {string} slug
 */
export const meetingSession = async (slug) => {
    return await SesiRapatModel.getMeetingBySlug(slug);
}

/**
 * Menyajikan data sesi rapat, list peserta, dan total peserta.
 * 
 * @param {string} slug
 */
export const meetingSessionWithListParticipants = async (slug) => {
    const meeting = await SesiRapatModel.getMeetingBySlug(slug);
    if (!meeting) {
        throw new HttpError(404, "Sesi rapat tidak ditemukan.", ERR.NOT_FOUND);
    }
    const listParticipants = (await SesiRapatKehadiranModel.getListParticipants(meeting.id)).map((row) => ({
        ...row,
        waktu_kehadiran: DateTimeParser(row.waktu_kehadiran).toLocalizedString("d MMM yyyy, 'Pukul' HH:mm"),
    }));
    const totalParticipants = listParticipants.length;
    return {
        meeting: toMeetingView(meeting),
        listParticipants,
        totalParticipants,
        link_kehadiran: new URL(`/daftar-kehadiran/${encodeURIComponent(meeting.slug_kehadiran)}`, process.env.SITE_URL).href,
    };
}