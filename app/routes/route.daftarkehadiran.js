import { Router } from "express";
import { getMeetingBySlugAttendance } from "../models/SesiRapatModel.js";
import { DateTimeParser } from "../services/DateTimeParser.js";

const router = Router();

const KOP_UPLOAD_PATH = '/uploads/kop-surat';
const KOP_DEFAULT = `${KOP_UPLOAD_PATH}/default.jpg`;

router.get("/daftar-kehadiran/:meetingSlug", async (req, res) => {
    const { meetingSlug } = req.params;
    const meeting = await getMeetingBySlugAttendance(meetingSlug);
    const isMeetingNotFound = (meeting === undefined);
    if (isMeetingNotFound || meeting.state !== 'Sedang Berlangsung') {
        return res.status(404).json({ error: "Meeting tidak ditemukan atau belum dibuka!" });
    }
    const { file_kop_surat: fileKop } = meeting;
    res.render("frontend/daftar_kehadiran", {
        title: "Formulir Daftar Kehadiran",
        fileKop: fileKop ? `${KOP_UPLOAD_PATH}/${fileKop}` : KOP_DEFAULT,
        meeting: meeting,
        tanggal: {
            original: DateTimeParser(meeting.tanggal).toLocalizedString("yyyy-MM-dd"),
            localized: DateTimeParser(meeting.tanggal).toLocalizedString("dd MMMM yyyy"),
        },
    });
});

export default router;