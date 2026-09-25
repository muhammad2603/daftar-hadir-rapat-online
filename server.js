import express from 'express';
import sharp from 'sharp';
import fs from 'fs';

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

app.get("/dashboard/pengaturan/daftar-user", (req, res) => {
    res.render("backend/daftar_user", {
        title: "Daftar User",
        currentNav: "pengaturan"
    });
});

app.get("/dashboard/sesi-rapat/create", (req, res) => {
    res.render("backend/form_buat_sesi_rapat", {
        title: "Buat Sesi Rapat Baru",
        currentNav: "kelola-sesi-rapat"
    });
});

app.get("/daftar-kehadiran/abc-def", (req, res) => {
    res.render("frontend/daftar_kehadiran", {
        title: "Formulir Daftar Kehadiran"
    });
});

// __COMMENT__ Kode untuk menyimpan tanda tangan menjadi file gambar png
app.get("/api/test/simpan-tanda-tangan", async (req, res) => {
    res.setHeader("Content-Type", 'text/html');
    try {
        const signatureBase64 = "iVBORw0KGgoAAAANSUhEUgAAAlgAAADICAYAAAA0n5+2AAAQAElEQVR4AezdB4xsbV0G8BWJidFoIhqxYiO2qCB2EbEbKxrFGguIRtQosYuiRsRGDFYsKBo7aMAWgmLvLWJFJdiNXRO79Oe53Nlv797du7O778yc8vty/vfMmTnznvf9vfe7++ScszN3O/IfAQIECBAgQIDAUAEBayinxggQIEBgjIBWCMxbQMCa9/zpPQECBAgQIDBBAQFrgpOiSwRGCGiDAAECBA4nIGAdzt6RCRAgQIAAgYUKCFjnTqwXCBAgQIAAAQJXExCwrubmXQQIECBA4DACjjoLAQFrFtOkkwQIECBAgMCcBASsOc2WvhIgMEJAGwQIENi5gIC1c2IHIECAAAECBNYmIGCtbcZHjFcbBAgQIECAwB0FBKw78niRAAECBAgQmIvAlPopYE1pNvSFAAECBAgQWISAgLWIaTQIAgQIjBDQBgECowQErFGS2iFAgAABAgQI3BQQsG5CWBEYIaANAgQIECBQAQGrCooAAQIECBAgMFBgYgFr4Mg0RYAAAQIECBA4kICAdSB4hyVAgACBGQnoKoFLCghYlwSzOwECBAgQIEDgIgEB6yIhrxMgMEJAGwQIEFiVgIC1quk2WAIECBAgQGAfAgLWPpRHHEMbBAgQIECAwGwEBKzZTJWOEiBAgACB6Qno0dkCAtbZLp4lQIAAAQIECFxZQMC6Mp03EiBAYISANggQWKKAgLXEWTUmAgQIECBA4KACAtZB+R18hIA2CBAgQIDA1AQErKnNiP4QIECAAAECsxe429HR7MdgAAQIECBAgACBSQk4gzWp6dAZAgQIEDgW8IDAjAUErBlPnq4TIECAAAEC0xQQsKY5L3pFYISANggQIEDgQAIC1oHgHZYAAQIECBBYroCAdae59RoBAgQIECBA4AoCAtYV0LyFAAECBAgcUsCxpy8gYE1/jvSQAAECBAgQmJmAgDWzCdNdAgRGCGiDAAECuxUQsHbrq3UCBAgQIEBghQIC1gonfcSQtUGAAAECBAicLyBgnW/jFQIECBAgQGBeApPprYA1manQEQIECBAgQGApAgLWUmbSOAgQIDBCQBsECAwRELCGMGqEAAECBAgQIHCXgIB1l4VHBEYIaIMAAQIECBwJWP4SECBAgAABAgQGC0wvYA0eoOYIECBAgAABAvsWELD2Le54BAgQIDBLAZ0mcBkBAesyWvYlQIAAAQIECGwhIGBtgWQXAgRGCGiDAAEC6xEQsNYz10ZKgAABAgQI7ElAwNoT9IjDaIMAAQIECBCYh4CANY950ksCBAgQIDBVAf06Q0DAOgPFUwQIECBAgACB6wgIWNfR814CBAiMENAGAQKLExCwFjelBkSAAAECBAgcWkDAOvQMOP4IAW0QIECAAIFJCQhYk5oOnSFAgAABAgSWIPCSgLWEkRgDAQIECBAgQGAiAgLWRCZCNwgQIEDgdgHPEJirgIA115nTbwIECBAgQGCyAgLWZKdGxwiMENAGAQIECBxCQMA6hLpjEliewJtmSJ+Q+tTU56U+LfWlqd9P/WHqd1K/nvqZ1FNSP5j67tQTUo9L/UDqa1PfkvrW1PelfjT1c6lfS/1eqtufnPXXpL4k9bmph6celnqH1EulLAQIEJiEgIB1wTR4mcBKBN4k4/z81HferH/J+kUX1PNPvN4Q9e3Z/obUV6S+PvWo1JulGr7eMuu3Tb1r6kGpD0t9TOqhqU9PfXjqEalPSn1i6iNTH5B6YOrtUm+e6vY3Z/1ZqS9OfWXqm1LflvqV1AtTF/V58/qfnLPvd+X5hsCfzfppqe9PtU/tb/v0odl+v9S9UxYCBAicKyBgnUvjBQKLEnjFjOYdUz370+DzU3n826m/TTV0/FHWj0l9/M26R9YXLS99wQ7PzOu/sGX9Rvb7xdR5+/9xXhu5vOE5jX1snm8IfJes3zv1EameVesZt55Ve1K2fzz1p6n/SdWu9Z95/Kup56T+JtX+dr+fzuNfTv1Sqmfd6vuZedwzb6+UtYXAVQW8b+ICAtbEJ0j3CFxSoP9Pv3ve89mpBoKeWfrXPP73VH/Q9+xPL929R7bvl3qNVJcGhIabJ2ajr/dMTUPGpl43z79aarPdEPL2N7e77uW503XfvN4zUNtUz1K98x3271mw0+1vtu+V97VfDUMNRX28qVr0UmLHdFH9WNqpwZ3qWdmnS4/9MnnQcJXV0cvnjzq8XtavmXrjVM909fgNtvfPds+69QzhY/O4Z946L31/66/zXI/77Kx7SfSHsv7q1Cbc/WQeN+R9VNZflfqy1BukLAQITFSg/xhPtGu6RYDABQIvm9c/JPUdqZ9I9ezJC7LuWZP+cO4lrQaTnilpIOgP8V5K6w/3z8h+DSG9dNfXXiHbDUIPybpnWn44658/UX+Zx/+Q2jzXe6N6T1W3u85LB1s6rvajAeTp6UUfb6qX+2rRMd1aR0entz/w6OjogUd3rl5KrVfr7tm3/4b2cUNVPTfVgHoy0DUU1awhqtV7yvL24+W18ugBqYamhs0H53FD8uby5Ptku5cpvzfrz0l9YaphrOFsU73s2QDYdc+m9YxkQ13vi+s9anmLhQCBfQn0H4d9HctxCBC4vkB/kPcepwaHXqJ6cppsKHrfrHv2JKvjpZeqHp+tj0v1Xqie6emZlP7A/bo81xDyu1lbri/wd2minptqQD0Z4Hrjf8/6bQLcfbJ/g1mrAbjB7N3y3CNTJ4PZ5nFDcYPZpv4j+51eetnzjfJk1z2b1nvq2ofeF9dgvQli/599ekasv2DQvwuvkm0LAQKDBQSswaAras5Q9yfw2jlU79npGZCGps0P6zx9vPQG7/6mXm8u783gPROyeV9/W6+XCo939mBSAr1822DWG+t71qmh6HQ1CG3CWde9p67h7PUzkoazVu/vaiD7xjzXG/97T1vPaGbzlqWXNntGrL9g0PD1T3m1Zyf7dyYPLQQIjBAQsEYoaoPAeIFe2vuCNNtg9FdZ9wxGf7Dm4Y2lZyN6VuKLstUfri+X9Vul+ht5vbm6lwuzaVm4wJ9nfA1nrf4GZINZPyKjlxZ7T9vmMuY7Zb/eD9bXezn5H7N9cnnVbPTMV1YWAnMXmEb/BaxpzINeEKjA6+SPL0/1JucGqz5u0MpTN5bNpZ3ei9N7pnq579F5pT9c/y9rC4GzBBrG+wsOvazcM1zvn53umeqN+f1lhwb5fr7YM/KchQCBQQIC1iBIzRC4okCDUi/59UM0/yJt9Iddb3LOwxtLg1Pv5+kN2L1Xp7+Z1o8K+K8br/qDwNUF/jtvbajqPX39bcUG+Dx1dOQPAgSuLyBgXd9QCwSuItAbznu/VO+p6g+43je1aadnHBqqPiVPNFT1N9L6EQK9qT1PWQgQIEBg6gIC1tRnSP9mKHDHLvfyXn9Fvx970HtlegZr84ZeGmyo6qXChqp+avn/bl60JkCAAIH5CAhY85krPZ2vQAPTU9P9npnqZzX1a1+yeWPpcz1b9V7Z6mcVNVT1c52yaSFAgACBuQpMMmDNFVO/CZwS6Kd599fle29V76E6+XKDVW9O7/fz9WxVv7rm5OseEyBAgMCMBQSsGU+erk9aoJ/C3e+je9ipXvYDIvt9gP3k7n68wm+det0mAQLTFdAzAlsLCFhbU9mRwFYCvcz3zOzZr2fJ6njph0k+Klv9JPZ+1Uk/+TubFgIECBBYooCAtcRZNaZ9C7xyDtgP+Gxo6od/vkW2N0t/Ff4R2einqvcLevulytlc6WLYBAgQWImAgLWSiTbMnQi8dVr9kVS/auRxWb96arM8Nw/6ier9+pG+5nOrAmIhQIDAWgQErHnNtN5OQ+Cj040/S/1m6oNT/U64rI6XnrV6ULb62Vb9jrc8tBAgQIDAmgQErDXNtrFeV6CX+Z6eRr4nde/U6eX5eaL3X90366elLAQIEFiJgGGeFhCwTovYJnC7wN3z1BNSz0m9Z+qspZcA+5uD/ZqbZ5+1g+cIECBAYD0CAtZ65tpIry7Qj1J4aN7eoJXVbcsf5Jm3SfVeK9/nFgjL5QW8gwCBZQkIWMuaT6MZL/DoNHmf1FlLv8bmkXnhfqlnpSwECBAgQOCGgIB1g8Ef8xfYyQielFYboLK6bXlGnrlX6jGp56UsBAgQIEDgWEDAOqbwgMAtAg1X/QqbW57Mxr+lPijV7w7856wtBAgQIEDgNoHjgHXbK54gsE6B+2fYf586Ha6ekud6E/s9sn5q6oUpCwECBAgQOFNAwDqTxZMrFnh8xn7P1GbpFzL3OwP7eVeP3TxpTYDA3gQciMAsBQSsWU6bTu9QoN8ZuGn+yXnQcNWQlYcWAgQIECCwnYCAtZ2TvdYj8IAM9Ymph6cenJr/YgQECBAgsHcBAWvv5A44A4GHpI+9VJiVhQABAgQIXF5AwLrYzB4ECBAgQIAAgUsJCFiX4rIzAQIECBCYioB+TFlAwJry7OgbAQIECBAgMEsBAWuW06bTBAiMENAGAQIEdiUgYO1KVrsECBAgQIDAagUErNVO/YiBa4MAAQIECBA4S0DAOkvFcwQIECBAgMB8BSbQcwFrApOgCwQIECBAgMCyBASsZc2n0RAgQGCEgDYIELimgIB1TUBvJ0CAAAECBAicFhCwTovYJjBCQBsECBAgsGoBAWvV02/wBAgQIECAwC4EphqwdjFWbRIgQIAAAQIE9iIgYO2F2UEIECBAYBkCRkFgOwEBazsnexEgQIAAAQIEthYQsLamsiMBAiMEtEGAAIE1CAhYa5hlYyRAgAABAgT2KiBg7ZV7xMG0QYAAAQIECExdQMCa+gzpHwECBAgQmIOAPt4iIGDdwmGDAAECBAgQIHB9AQHr+oZaIECAwAgBbRAgsCABAWtBk2koBAgQIECAwDQEBKxpzINejBDQBgECBAgQmIiAgDWRidANAgQIECBAYDkCJwPWckZlJAQIECBAgACBAwoIWAfEd2gCBAgQ2EbAPgTmJyBgzW/O9JgAAQIECBCYuICANfEJ0j0CIwS0QYAAAQL7FRCw9uvtaAQIECBAgMAKBASsrSbZTgQIECBAgACB7QUErO2t7EmAAAECBKYloDeTFRCwJjs1OkaAAAECBAjMVUDAmuvM6TcBAiMEtEGAAIGdCAhYO2HVKAECBAgQILBmAQFrzbM/YuzaIECAAAECBG4TELBuI/EEAQIECBAgMHeBQ/dfwDr0DDg+AQIECBAgsDgBAWtxU2pABAgQGCGgDQIEriMgYF1Hz3sJECBAgAABAmcICFhnoHiKwAgBbRAgQIDAegUErPXOvZETIECAAAECOxKYcMDa0Yg1S4AAAQIECBDYsYCAtWNgzRMgQIDAwgQMh8AWAgLWFkh2IUCAAAECBAhcRkDAuoyWfQkQGCGgDQIECCxeQMBa/BQbIAECBAgQILBvAQFr3+IjjqcNAgQIECBAYNICAtakp0fnCBAgQIDAfAT09C4BAesuC48IECBAgAABAkMEBKwhjBohtYbDnQAAA8NJREFUQIDACAFtECCwFAEBaykzaRwECBAgQIDAZAQErMlMhY6MENAGAQIECBCYgoCANYVZ0AcCBAgQIEBgUQKnAtaixmYwBAgQIECAAIGDCAhYB2F3UAIECBC4lICdCcxMQMCa2YTpLgECBAgQIDB9AQFr+nOkhwRGCGiDAAECBPYoIGDtEduhCBAgQIAAgXUICFjbzrP9CBAgQIAAAQJbCghYW0LZjQABAgQITFFAn6YpIGBNc170igABAgQIEJixgIA148nTdQIERghogwABAuMFBKzxplokQIAAAQIEVi4gYK38L8CI4WuDAAECBAgQuFVAwLrVwxYBAgQIECCwDIGDjkLAOii/gxMgQIAAAQJLFBCwljirxkSAAIERAtogQODKAgLWlem8kQABAgQIECBwtoCAdbaLZwmMENAGAQIECKxUQMBa6cQbNgECBAgQILA7gWkHrN2NW8sECBAgQIAAgZ0JCFg7o9UwAQIECCxVwLgIXCQgYF0k5HUCBAgQIECAwCUFBKxLgtmdAIERAtogQIDAsgUErGXPr9ERIECAAAECBxAQsA6APuKQ2iBAgAABAgSmKyBgTXdu9IwAAQIECMxNQH9vCghYNyGsCBAgQIAAAQKjBASsUZLaIUCAwAgBbRAgsAgBAWsR02gQBAgQIECAwJQEBKwpzYa+jBDQBgECBAgQOLiAgHXwKdABAgQIECBAYGkCtwespY3QeAgQIECAAAECexYQsPYM7nAECBAgcDUB7yIwJwEBa06zpa8ECBAgQIDALAQErFlMk04SGCGgDQIECBDYl4CAtS9pxyFAgAABAgRWIyBgXWKq7UqAAAECBAgQ2EZAwNpGyT4ECBAgQGC6Ano2QQEBa4KToksECBAgQIDAvAUErHnPn94TIDBCQBsECBAYLCBgDQbVHAECBAgQIEBAwPJ3YISANggQIECAAIETAgLWCQwPCRAgQIAAgSUJHG4sAtbh7B2ZAAECBAgQWKiAgLXQiTUsAgQIjBDQBgECVxMQsK7m5l0ECBAgQIAAgXMFBKxzabxAYISANggQIEBgjQIC1hpn3ZgJECBAgACBnQpMPmDtdPQaJ0CAAAECBAjsQEDA2gGqJgkQIEBg8QIGSOCOAgLWHXm8SIAAAQIECBC4vICAdXkz7yBAYISANggQILBgAQFrwZNraAQIECBAgMBhBASsw7iPOKo2CBAgQIAAgYkKCFgTnRjdIkCAAAEC8xTQ6woIWFVQBAgQIECAAIGBAgLWQExNESBAYISANggQmL/AiwEAAP//VGJA/AAAAAZJREFUAwCyP4Cgw3t0cQAAAABJRU5ErkJggg==";
        const imageBuffer = Buffer.from(signatureBase64, 'base64');
        await sharp(imageBuffer)
            .trim({
                background: 'rgba(0,0,0,0)',
                threshold: 0
            })
            .png()
            .toFile('signature.png');
        res.send("Signature berhasil tersimpan. Cek file signature.png!");
    } catch (error) {
        res.send("Gagal menyimpan gambar Signature! ;( Cek konfigurasi Sharp Anda!");
    }
});

app.listen(port, hostname, () => {
    console.log(`Server listening on http://${hostname}:${port}`);
});