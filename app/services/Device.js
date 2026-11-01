/**
 * @typedef {Object} EvaluateLoginReturns
 * 
 * @property {boolean} requires2fa `TRUE` jika membutuhkan verifikasi 2FA
 * @property {string} [reason]
 * @property {object} [device]
 * @property {object} geo
 */

import crypto from 'crypto';
import { lookupGeo } from './GeoIP.js';
import { findDevice, insertDevice, updateDevice } from '../models/UserDevicesModel.js';
import 'dotenv/config';

export const DEVICE_COOKIE = 'device_token';
// Waktu cookie aktif 30 hari
const DEVICE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

const sha256 = (v) => crypto.createHash('sha256').update(String(v)).digest('hex');

const deviceCookieOptions = {
    httpOnly: true,
    secure: (process.env.APP_ENV === 'production'),
    sameSite: 'lax',
    path: '/',
    maxAge: DEVICE_TTL_MS
}

/**
 * Putuskan apakah login membutuhkan verifikasi 2FA.
 * 
 * @param {Object} params
 * @param {{ id: number, twoFactorEnabled: boolean }} params.user
 * @param {import('express').Request} params.req
 * 
 * @returns {Promise<EvaluateLoginReturns>}
 */
export async function evaluateLogin({ user, req }) {
    const geo = lookupGeo(req.ip);
    if (!user.twoFactorEnabled) return { requires2fa: false, geo };
    const token = req.cookies?.[DEVICE_COOKIE];
    const device = token ? await findDevice(user.id, sha256(token)) : null;
    if (!device || device.revoked_at || device.trusted_until.getTime() < Date.now()) {
        return { requires2fa: true, reason: 'device_baru', geo };
    }
    if (geo.country && device.last_country && geo.country !== device.last_country) {
        return { requires2fa: true, reason: 'negara_berbeda', geo };
    }
    return { requires2fa: false, device, geo };
}

/**
 * Perbarui jejak login pada perangkat yang sudah dikenal
 */
export async function touchDevice(device, { geo, req }) {
    await updateDevice(device.id, {
        last_seen_at: new Date(Date.now()),
        last_country: geo.country ?? device.last_country,
        last_city: geo.city,
        last_asn: geo.asn,
        user_agent: req.get('user-agent')
    })
}

/**
 * Daftarkan perangkat sebagai terpercaya setelah 2FA lolos
 */
export async function registerDevice({ userId, req, res }) {
    const geo = lookupGeo(req.ip);
    const trustedUntil = new Date(Date.now() + DEVICE_TTL_MS);
    const current = req.cookies?.[DEVICE_COOKIE];
    const existing = current ? await findDevice(userId, sha256(current)) : null;
    if (existing && !existing.revoked_at) {
        await updateDevice(existing.id, {
            last_country: geo.country,
            last_city: geo.city,
            last_asn: geo.asn,
            trusted_until: trustedUntil,
            last_seen_at: new Date(Date.now())
        });
        res.cookie(
            DEVICE_COOKIE,
            current,
            deviceCookieOptions
        );
        return;
    }
    const token = crypto.randomBytes(32).toString('hex');
    await insertDevice({
        user_id: userId,
        device_token_hash: sha256(token),
        user_agent: req.get('user-agent'),
        last_country: geo.country,
        last_city: geo.city,
        last_asn: geo.asn,
        trusted_until: trustedUntil
    });
    res.cookie(
        DEVICE_COOKIE,
        token,
        deviceCookieOptions
    );
}