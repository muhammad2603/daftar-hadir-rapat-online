import { PERMISSIONS, ROLES_PERMISSION } from "../config/config.permissions.js";
import { getUserPermissions } from "../models/UserPermissionsModel.js";
import { getRoleIdentityUser } from "../models/UsersModel.js";

/**
 * Fungsi untuk hak izin pengguna
 * @param {number} userId
 */
export function user(userId) {
    return {
        /**
         * Cek apakah pengguna memiliki hak izin.
         * 
         * @param {string} permission Perizinan dengan format `context.action`.
         * 
         * @see {@link PERMISSIONS} Untuk melihat format permission.
         */
        can: async (permission) => {
            const userRole = (await getRoleIdentityUser(userId))?.role;
            // Memastikan bahwa role pengguna ada
            if (!userRole) {
                return false;
            }
            const user = {
                role: userRole,
                permissions: await getUserPermissions(userId),
            };
            /** @type {string[]} */
            const role_perms = ROLES_PERMISSION[user.role];
            if (user.role === "superadmin") {
                const [contextPerm, _] = permission.split(".");
                // RegExp menentukan apakah context permission ada dan diakhiri dengan wildcard (*) diconfig permissions
                const regexContextPerm = new RegExp(`^${contextPerm}\\.\\*$`);
                const isWildcardExist = role_perms.some((perm) => regexContextPerm.test(perm));
                const isPermissionExist = role_perms.includes(permission);
                if (!isWildcardExist && !isPermissionExist) {
                    return false;
                }
                return true;
            }
            /** Hak izin pengguna dari database */
            const userPermissions = user.permissions;
            if (userPermissions.denied.includes(permission)) {
                return false;
            }
            if (user.role !== 'superadmin') {
                /** Jika hak izin pengguna yang diizinkan dari database kosong */
                const isUserGrantPermissionEmpty = userPermissions.granted.length === 0;
                if (isUserGrantPermissionEmpty) {
                    // Cek apakah perizinan yang diminta tidak ada diperizinan role dari config
                    if (!role_perms.includes(permission)) {
                        return false;
                    }
                } else {
                    // NOTE: Blok dibawah ini bersifat Source of Truth, karena perizinan didatabase adalah sumber kebenaran.
                    // Cek apakah perizinan yang diminta tidak ada didaftar list permission granted pengguna
                    if (!userPermissions.granted.includes(permission)) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        }
    }
}