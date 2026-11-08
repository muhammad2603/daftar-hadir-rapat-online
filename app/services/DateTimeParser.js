/**
 * @callback LocalizedStringFn
 * 
 * @param {string} [fmt] Token format date-fns. Default `dd MMMM yyyy HH:mm:ss`.
 * @returns {string}
 */

/**
 * @typedef {Object} DateTimeParserReturn
 * 
 * @property {LocalizedStringFn} toLocalizedString
 */

/**
 * @callback OnMinutesFn
 * 
 * @param {Date} target Target tanggal dan waktu
 * 
 * @return {number}
 * Mengembalikan positif jika perbandingan dari masa lalu ke masa depan, mengembalikan negatif jika dari sebaliknya.
 */

/**
 * @typedef {Object} DateTimeDifferencesReturn
 * 
 * @property {OnMinutesFn} onMinutes
 */

import { format, differenceInMinutes } from "date-fns";
import { id } from "date-fns/locale";

/**
 * Parser tanggal dan waktu menggunakan date-fns
 * 
 * @param {Date} datetime
 * @returns {DateTimeParserReturn}
 * @see https://date-fns.org/docs/format Daftar token format date-fns yang dapat digunakan
 */
export function DateTimeParser(datetime) {
    return {
        toLocalizedString: (fmt = "dd MMMM yyyy HH:mm:ss") => {
            return format(datetime, fmt, { locale: id });
        },
    }
}

/**
 * Menghitung perbedaan tanggal dan waktu
 * 
 * @param {Date} from
 * 
 * @returns {DateTimeDifferencesReturn}
 */
export function DateTimeDifferences(from) {
    return {
        onMinutes: (target) => {
            return differenceInMinutes(
                target,
                from
            );
        },
    }
}