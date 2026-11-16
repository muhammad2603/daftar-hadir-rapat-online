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
 * Label hak izin pengguna
 */
export const PERMISSION_LABELS = {
    "meeting_session.create": "Membuat Sesi Rapat",
    "meeting_session.update": "Perbarui Sesi Rapat",
    "meeting_session.delete": "Menghapus Sesi Rapat",
    "meeting_session.endsession": "Mengakhiri Sesi Rapat",
    "user.create": "Membuat User",
    "user.update": "Perbarui User",
    "user.delete": "Menghapus User",
    "user.grant": "Mengizinkan Hak Izin User",
    "user.revoke": "Mencabut Hak Izin User",
}

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
    ],
}

/**
 * Tolak hak izin untuk role selain superadmin
 */
export const DENY_FROM_OTHER_ROLES = [
    "user.update",
    "user.delete",
    "user.grant",
    "user.revoke",
]