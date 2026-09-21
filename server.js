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

app.listen(port, hostname, () => {
    console.log(`Server listening on http://${hostname}:${port}`);
});