import express from 'express';
import cookieParser from 'cookie-parser';
import { requireFullAuth } from './app/middlewares/auth.js';
import daftarKehadiranRoute from './app/routes/route.daftarkehadiran.js';
import APIRoute from './app/routes/route.api.js';
import activateTwoFactor from './app/routes/route.activatetwofactor.js';
import verifyTwoFactor from './app/routes/route.verifytwofactor.js';
import resendTwoFactor from './app/routes/route.resendtwofactor.js';
import login from './app/routes/route.login.js';
import logout from './app/routes/route.logout.js';
import dashboardRoute from './app/routes/route.dashboard.js';
import 'dotenv/config';

const app = express();
const hostname = 'localhost';
const port = Number(process.env.APP_PORT || 3000);

if (process.env.APP_ENV === 'production') {
    app.set('trust proxy', 1);
}
app.set("view engine", "ejs");
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());

app.use(daftarKehadiranRoute);
app.use(login);
app.use(APIRoute);
app.use(activateTwoFactor);
app.use(verifyTwoFactor);
app.use(resendTwoFactor);
app.use(requireFullAuth);
app.use(dashboardRoute);
app.use(logout);

app.listen(port, hostname, () => {
    console.log(`Server listening on http://${hostname}:${port}`);
});