/**
 * @typedef {Object} NotificationOptions
 * 
 * @property {number} [duration]
 * Durasi notifikasi ditampilkan, default 3000 (dalam detik).
 * @property {boolean} [ripple]
 * Animasi saat notifikasi muncul, default false.
 */

/**
 * @typedef {(message: string, iconSvgString?: string, background?: string) => void} NotificationSuccess
 */

/**
 * @typedef {(message: string, iconSvgString?: string, background?: string) => void} NotificationError
 */

/**
 * @typedef {(type: "info", message: string, iconSvgString?: string, background?: string) => void} NotificationCustom
 */

/**
 * @typedef {Object} NotificationMethods
 * 
 * @property {NotificationSuccess} success
 * @property {NotificationError} error
 * @property {NotificationCustom} custom
 */

import { Notyf } from "../libs/notyf/notyf.es.js";
import { IconSuccess, IconError, IconInfo } from "../utils/notification/IconsNotification.js";

const types = [
    {
        type: 'info',
        background: 'linear-gradient(8deg,rgba(16, 99, 232, 1) 20%, rgba(61, 135, 255, 1) 60%, rgba(196, 219, 255, 1) 100%)',
        icon: IconInfo
    }
];

/**
 * Tampilkan notifikasi dari Notyf
 * 
 * @param {NotificationOptions} options
 * 
 * @return {NotificationMethods}
 */
const Notification = (options) => {
    const opts = {
        duration: options?.duration ?? 3000,
        ripple: options?.ripple ?? false,
        types: types
    };
    const notyf = new Notyf(opts);
    return {
        success(
            message,
            iconSvgString = undefined,
            background = 'linear-gradient(5deg,rgba(87, 199, 133, 1) 20%, rgba(147, 214, 124, 1) 60%, rgba(190, 242, 126, 1) 100%)'
        ) {
            notyf.success({
                message: message,
                icon: iconSvgString ?? IconSuccess,
                background: background
            });
        },
        error(
            message,
            iconSvgString = undefined,
            background = 'linear-gradient(8deg,rgba(227, 77, 77, 1) 20%, rgba(247, 131, 82, 1) 60%, rgba(255, 171, 175, 1) 100%)'
        ) {
            notyf.error({
                message: message,
                icon: iconSvgString ?? IconError,
                background: background
            });
        },
        custom(type, message) {
            notyf.open({
                type: type,
                message: message
            });
        }
    };
}

export { Notification };