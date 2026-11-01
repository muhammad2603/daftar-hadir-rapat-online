/**
 * @typedef {Object} GeoIPReturns
 * 
 * @property {string|null} country Kode ISO Negara (2 huruf)
 * @property {string|null} city
 * @property {number|null} asn AS Number
 * @property {string|null} asOrg AS Organization
 */

import maxmind from 'maxmind';
import 'dotenv/config';

const cityDb = await maxmind.open(process.env.GEOIP_CITY_DB);
const asnDb = await maxmind.open(process.env.GEOIP_ASN_DB);

const EMPTY = {
    country: null,
    city: null,
    asn: null,
    asOrg: null
};

/**
 * Melakukan fallback IP Address dilingkungan development
 * 
 * @param {string} ip
 * 
 * @returns {string}
 * IP Address akan diset menjadi 8.8.8.8 atau IP_FALLBACK_DEV di .env jika environment aplikasi adalah `development`
 */
const ipFallback = (ip) => {
    if (process.env.APP_ENV === 'development' && (ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1')) {
        return process.env.IP_FALLBACK_DEV ?? '8.8.8.8';
    }
    return ip;
}

/**
 * Mencari GeoLocation berdasarkan IP Address
 * @param {string} ip
 * @returns {GeoIPReturns} 
 */
export function lookupGeo(ip) {
    try {
        const ip_address = ipFallback(ip);
        const c = cityDb.get(ip_address);
        const a = asnDb.get(ip_address);
        return {
            country: c?.country?.iso_code ?? null,
            city: c?.city?.names?.en ?? null,
            asn: a?.autonomous_system_number ?? a?.traits?.autonomous_system_number ?? null,
            asOrg: a?.autonomous_system_organization ?? a?.traits?.autonomous_system_organization ?? null
        }
    } catch (err) {
        return EMPTY;
    }
}