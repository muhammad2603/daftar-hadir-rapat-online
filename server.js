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
})

app.listen(port, hostname, () => {
    console.log(`Server listening on http://${hostname}:${port}`);
});