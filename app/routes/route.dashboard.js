import { Router } from "express";
import {
    getAllTotalMeetingsSession,
    getHighlightMeetingsInProgressCurrDay,
    getAllHighlightMeetingsIsNotCompleted,
    getHighlightMeetingsWithParticipants,
    meetingsCompletedWithPresences,
    meetingsInProgressWithLinkAttendance,
    meetingSession,
    meetingSessionWithListParticipants,
} from "../services/MeetingsSession.js";
import { getTotalMeetingsSessionCompleted } from "../models/SesiRapatModel.js";
import { getTotalPresencesOnMeetingsCompleted } from "../models/SesiRapatKehadiranModel.js";

const router = Router();

router.use((req, res, next) => {
    const u = req.user;
    res.locals.user = {
        username: u.username,
        email: u.email,
        role: u.role,
        twoFactorEnabled: u.twoFactorEnabled,
    };
    next();
})

router.get("/dashboard", async (req, res) => {
    res.render("backend/dashboard", {
        title: "Dashboard",
        currentNav: "dashboard",
        meetingsInProgressCurrDay: await getHighlightMeetingsInProgressCurrDay(),
        totalMeetings: await getAllTotalMeetingsSession(),
    });
});

router.get("/dashboard/sesi-rapat/kelola", async (req, res) => {
    res.render("backend/kelola_sesi_rapat", {
        title: "Kelola Sesi Rapat",
        currentNav: "kelola-sesi-rapat",
        allMeetingsNotCompleted: await getAllHighlightMeetingsIsNotCompleted(),
    });
});

router.get("/dashboard/monitor-kehadiran", async (req, res) => {
    const { meetingsInProgress, meetingsCompleted } = await getHighlightMeetingsWithParticipants();
    res.render("backend/monitor_kehadiran", {
        title: "Monitor Kehadiran",
        currentNav: "monitor-kehadiran",
        meetingsInProgress,
        meetingsCompleted,
    });
});

router.get("/dashboard/monitor-kehadiran/:meetingSlug", async (req, res) => {
    const slug = req.params.meetingSlug;
    // TODO Cek ketersediaan sesi rapat
    // TODO Validasi state rapat, jika state Belum Dimulai, maka tidak dapat monitoring list peserta.
    const { meeting, listParticipants, totalParticipants, link_kehadiran } = await meetingSessionWithListParticipants(slug);
    res.render("backend/live_view_kehadiran", {
        title: "Live View Kehadiran",
        currentNav: "monitor-kehadiran",
        meetingData: meeting,
        listParticipants,
        totalParticipants,
        link_kehadiran
    });
});

router.get("/dashboard/sesi-rapat/detail/:meetingSlug", async (req, res) => {
    const slug = req.params.meetingSlug;
    // TODO Cek ketersediaan sesi rapat
    const { meeting, listParticipants, totalParticipants, link_kehadiran } = await meetingSessionWithListParticipants(slug);
    res.render("backend/detail_sesi_rapat", {
        title: "Detail Sesi Rapat",
        currentNav: "kelola-sesi-rapat",
        meetingData: meeting,
        listParticipants,
        totalParticipants,
        link_kehadiran,
    });
});

router.get("/dashboard/sesi-rapat/edit/:meetingSlug", async (req, res) => {
    const slug = req.params.meetingSlug;
    // TODO Cek ketersediaan sesi rapat dan pastikan sesi rapat hanya boleh diedit jika state-nya adalah "Belum Dimulai"
    res.render("backend/edit_sesi_rapat", {
        title: "Edit Sesi Rapat",
        currentNav: "kelola-sesi-rapat",
        meetingData: await meetingSession(slug),
    });
});

router.get("/dashboard/sesi-rapat/riwayat", async (req, res) => {
    res.render("backend/riwayat_sesi_rapat", {
        title: "Riwayat Sesi Rapat",
        currentNav: "riwayat-sesi-rapat",
        totalMeetingsCompleted: await getTotalMeetingsSessionCompleted(),
        totalPresencesOnMeetingsCompleted: await getTotalPresencesOnMeetingsCompleted(),
        meetingsCompletedWithPresences: await meetingsCompletedWithPresences(),
    });
});

router.get("/dashboard/sesi-rapat/bagikan-tautan", async (req, res) => {
    res.render("backend/bagikan_tautan", {
        title: "Bagikan Tautan",
        currentNav: "bagikan-tautan",
        meetingsWithLinkAttendance: await meetingsInProgressWithLinkAttendance(),
    });
});

router.get("/dashboard/pengaturan", (req, res) => {
    res.render("backend/pengaturan", {
        title: "Pengaturan",
        currentNav: "pengaturan"
    });
});

router.get("/dashboard/pengaturan/daftar-user", (req, res) => {
    // TODO Halaman daftar user hanya dapat dilihat oleh Admin
    res.render("backend/daftar_user", {
        title: "Daftar User",
        currentNav: "pengaturan"
    });
});

router.get("/dashboard/sesi-rapat/create", (req, res) => {
    res.render("backend/form_buat_sesi_rapat", {
        title: "Buat Sesi Rapat Baru",
        currentNav: "kelola-sesi-rapat"
    });
});

export default router;