import { Router } from "express";
import {
    getAllTotalMeetingsSession,
    getHighlightMeetingsInProgressCurrDay,
    getAllHighlightMeetingsIsNotCompleted,
    getHighlightMeetingsWithParticipants,
} from "../services/MeetingsSession.js";

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

router.get("/dashboard/monitor-kehadiran/abc-def", (req, res) => {
    res.render("backend/live_view_kehadiran", {
        title: "Live View Kehadiran",
        currentNav: "monitor-kehadiran"
    });
});

router.get("/dashboard/sesi-rapat/detail/abc-def", (req, res) => {
    res.render("backend/detail_sesi_rapat", {
        title: "Detail Sesi Rapat",
        currentNav: "kelola-sesi-rapat"
    });
});

router.get("/dashboard/sesi-rapat/edit/abc-def", (req, res) => {
    res.render("backend/edit_sesi_rapat", {
        title: "Edit Sesi Rapat",
        currentNav: "kelola-sesi-rapat"
    });
});

router.get("/dashboard/sesi-rapat/riwayat", (req, res) => {
    res.render("backend/riwayat_sesi_rapat", {
        title: "Riwayat Sesi Rapat",
        currentNav: "riwayat-sesi-rapat"
    });
});

router.get("/dashboard/sesi-rapat/bagikan-tautan", (req, res) => {
    res.render("backend/bagikan_tautan", {
        title: "Bagikan Tautan",
        currentNav: "bagikan-tautan"
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