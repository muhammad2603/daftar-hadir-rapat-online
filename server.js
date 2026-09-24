import express from 'express';

const app = express();

const hostname = 'localhost';
const port = process.env.APP_PORT || 3000;

app.set("view engine", "ejs");

app.use(express.static('public'));

app.get("/", (req, res) => {
    res.render("frontend/login", {
        title: process.env.SITE_TITLE
    });
});

app.get("/dashboard", (req, res) => {
    res.render("backend/dashboard", {
        title: "Dashboard",
        currentNav: "dashboard"
    });
});

app.get("/dashboard/sesi-rapat/kelola", (req, res) => {
    res.render("backend/kelola_sesi_rapat", {
        title: "Kelola Sesi Rapat",
        currentNav: "kelola-sesi-rapat"
    });
});

app.get("/dashboard/monitor-kehadiran", (req, res) => {
    res.render("backend/monitor_kehadiran", {
        title: "Monitor Kehadiran",
        currentNav: "monitor-kehadiran"
    });
});

app.get("/dashboard/monitor-kehadiran/abc-def", (req, res) => {
    res.render("backend/live_view_kehadiran", {
        title: "Live View Kehadiran",
        currentNav: "monitor-kehadiran"
    });
});

app.get("/dashboard/sesi-rapat/detail/abc-def", (req, res) => {
    res.render("backend/detail_sesi_rapat", {
        title: "Detail Sesi Rapat",
        currentNav: "kelola-sesi-rapat"
    });
});

app.get("/dashboard/sesi-rapat/edit/abc-def", (req, res) => {
    res.render("backend/edit_sesi_rapat", {
        title: "Edit Sesi Rapat",
        currentNav: "kelola-sesi-rapat"
    });
});

app.get("/dashboard/sesi-rapat/riwayat", (req, res) => {
    res.render("backend/riwayat_sesi_rapat", {
        title: "Riwayat Sesi Rapat",
        currentNav: "riwayat-sesi-rapat"
    });
});

app.get("/dashboard/sesi-rapat/bagikan-tautan", (req, res) => {
    res.render("backend/bagikan_tautan", {
        title: "Bagikan Tautan",
        currentNav: "bagikan-tautan"
    });
});

app.get("/dashboard/pengaturan", (req, res) => {
    res.render("backend/pengaturan", {
        title: "Pengaturan",
        currentNav: "pengaturan"
    });
});

app.get("/dashboard/sesi-rapat/create", (req, res) => {
    res.render("backend/form_buat_sesi_rapat", {
        title: "Buat Sesi Rapat Baru",
        currentNav: "kelola-sesi-rapat"
    });
});

app.listen(port, hostname, () => {
    console.log(`Server listening on http://${hostname}:${port}`);
});