/**
 * Daftar hak izin.
 * 
 * Hak izin memiliki format penulisan `context.permission`, `context` adalah grup aksi,
 * sedangkan `permission` adalah hak izin yang dimiliki oleh grup.
 */
export const PERMISSIONS = {
    MEETING_SESSION: [
        "meeting_session.create",
        "meeting_session.update",
        "meeting_session.delete",
        "meeting_session.endsession",
    ],
    USER: [
        "user.create",
        "user.update",
        "user.delete",
        "user.grant",
        "user.revoke",
    ],
};

/**
 * Hak izin yang diizinkan berdasarkan peran (role).
 * 
 * Hak izin peran dijadikan sebagai acuan default jika pengguna tidak memiliki perizinan ditable user_permissions.
 * 
 * Catatan: jadikan ini sebagai **hak minimalis** yang dibutuhkan. Hak izin yang menggunakan simbol bintang (wildcard) akan mengizinkan
 * semua perizinan didalamnya, gunakan dengan bijak.
 */
export const ROLES_PERMISSION = {
    superadmin: [
        "meeting_session.*",
        "user.*"
    ],
    admin: [
        "meeting_session.create",
        "meeting_session.update",
        "user.update"
    ],
}