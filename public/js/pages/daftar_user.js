import { PopUp } from "../cores/PopUp.js";
import { Notification } from "../cores/Notification.js";
import { IconsNotification } from "../utils/notification/IconsNotification.js";

const loadingSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-loader-circle preview-icon size-4 animate-spin">
<path d="M21 12a9 9 0 1 1-6.219-8.56"/>
</svg>`;

const loadingSvgSmall = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-loader-circle preview-icon size-3.5 animate-spin">
<path d="M21 12a9 9 0 1 1-6.219-8.56"/>
</svg>`;

const notification = Notification();

document.addEventListener("DOMContentLoaded", () => {
    const popUpCreateUser = new PopUp(document.getElementById("popUpCreateUser"));
    const btnFormCreateUser = document.getElementById("btnFormCreateUser");
    const btnCancelCreateUser = document.getElementById("btnCancelCreateUser");
    const btnCreateUser = document.getElementById("btnCreateUser");
    const textBtnCreateUser = btnCreateUser.innerText;
    btnFormCreateUser.addEventListener("click", () => {
        popUpCreateUser.showPopUp();
    });
    btnCancelCreateUser.addEventListener("click", () => {
        popUpCreateUser.closePopUp();
    });
    btnCreateUser.addEventListener("click", function () {
        /** @type {HTMLButtonElement} */
        const currBtn = this;
        btnCancelCreateUser.disabled = true;
        // __COMMENT__ Animasi loading state
        currBtn.disabled = true;
        currBtn.innerHTML = loadingSvg + "Sebentar";
        console.log("Sedang menambahkan user...");
        // __COMMENT__ State ketika telah mendapatkan response dari server
        /**
         * Pop Up harus ditutup setelah fetch telah berhasil mendapatkan response dari server
         */
        setTimeout(() => {
            currBtn.innerText = textBtnCreateUser;
            currBtn.removeAttribute("disabled");
            btnCancelCreateUser.removeAttribute("disabled");
            uncheckPermissionsSelected();
            popUpCreateUser.closePopUp();
            notification.success("User baru berhasil ditambahkan.");
        }, 5000);
    });
    const popUpEditUserWindow = document.getElementById('popUpEditUser');
    const btnConfirmPopUpEditUser = document.getElementById("btnConfirmPopUpEditUser");
    const btnEditUser = document.querySelectorAll("button.btn-edit-user");
    const btnClosePopUpEditUser = document.getElementById('btnClosePopUpEditUser');
    const inputEditUsername = document.getElementById('editUsername');
    const inputEditEmail = document.getElementById('editEmail');
    const popUpEditUser = new PopUp(popUpEditUserWindow);
    /** @type {HTMLSelectElement} */
    const selectRoleOnEditUser = popUpEditUserWindow.querySelector("select#editRole");
    /** @type {HTMLSpanElement} */
    const cannotChangeRoleMessageEl = selectRoleOnEditUser.nextElementSibling;
    /** @type {number|null} User ID yang akan diedit */
    let editUserId = null;
    /** @type {string|null} Username yang akan diedit */
    let editUsername = null;
    btnEditUser.forEach(btn => {
        btn.addEventListener("click", function () {
            /** @type {HTMLElement} */
            const currBtn = this;
            const isCurrentUser = Boolean(parseInt(currBtn.dataset.isCurrentUser));
            if (isCurrentUser) {
                selectRoleOnEditUser.disabled = true;
                cannotChangeRoleMessageEl.classList.remove("hidden");
            } else {
                selectRoleOnEditUser.disabled = false;
                cannotChangeRoleMessageEl.classList.add("hidden");
            }
            const userRow = currBtn.closest("tr.user-row");
            const { id, username, email, role } = JSON.parse(userRow.dataset.user);
            /** @type {HTMLOptionElement | null} */
            const getOptionRole = popUpEditUserWindow.querySelector(`select option[data-role-option="${role}"]`);
            getOptionRole.selected = true;
            editUserId = id;
            inputEditUsername.value = username;
            inputEditEmail.value = email;
            editUsername = username;
            popUpEditUser.showPopUp();
        });
    });
    btnClosePopUpEditUser.addEventListener("click", () => {
        inputEditUsername.value = '';
        inputEditEmail.value = '';
        editUserId = null;
        editUsername = null;
        popUpEditUser.closePopUp();
    });
    const textBtnEditUserDefault = btnConfirmPopUpEditUser.innerText;
    btnConfirmPopUpEditUser.addEventListener("click", function () {
        if (editUserId === null) return;
        /** @type {HTMLButtonElement} */
        const currBtn = this;
        btnClosePopUpEditUser.disabled = true;
        // __COMMENT__ Animasi loading state
        currBtn.disabled = true;
        currBtn.innerHTML = loadingSvg + "Sebentar";
        console.log(`Sedang mengedit user dengan ID ${editUserId}...`);
        // __COMMENT__ State ketika telah mendapatkan response dari server
        /**
         * Saat server mengembalikan response OK, server harus memberikan list user yg terbaru 
         */
        setTimeout(() => {
            currBtn.innerText = textBtnEditUserDefault;
            currBtn.removeAttribute("disabled");
            popUpEditUser.closePopUp();
            btnClosePopUpEditUser.removeAttribute("disabled");
            notification.success(`User ${editUsername} berhasil diperbarui!`);
        }, 5000);
    });
    const btnDeleteUser = document.querySelectorAll("button.btn-delete-user");
    const popUpDeleteUser = new PopUp(document.getElementById("confirm"));
    btnDeleteUser.forEach(btn => {
        btn.addEventListener("click", async function () {
            /** @type {HTMLButtonElement} */
            const currBtn = this;
            /** @type {HTMLButtonElement} */
            const nextBtn = currBtn.nextElementSibling;
            /** @type {SVGElement} */
            const btnSvg = currBtn.firstElementChild;
            // __FIX__ Tombol delete tidak butuh atribut data-user-id, karena tag tr (table row) sudah memiliki data user dengan format JSON
            const getUserId = currBtn.dataset.userId;
            const { confirmed, closed } = await popUpDeleteUser.openPopUpConfirm({ header: "Apakah Anda yakin ingin menghapus user?" });
            if (closed) {
                popUpDeleteUser.closePopUp();
            }
            if (confirmed) {
                nextBtn.disabled = true;
                // __COMMENT__ Animasi loading state
                currBtn.disabled = true;
                btnSvg.classList.add("hidden");
                currBtn.insertAdjacentHTML("afterbegin", loadingSvgSmall);
                popUpDeleteUser.closePopUp();
                console.log(`Sedang menghapus user dengan ID ${getUserId}...`);
                // __COMMENT__ State ketika telah mendapatkan response dari server
                /**
                 * Pop Up harus ditutup setelah fetch telah berhasil mendapatkan response dari server
                 */
                setTimeout(() => {
                    currBtn.firstElementChild.remove();
                    btnSvg.classList.remove("hidden");
                    currBtn.removeAttribute("disabled");
                    nextBtn.removeAttribute("disabled");
                    notification.success("User berhasil dihapus!");
                }, 5000);
            }
        });
    });
    const popUpEditUserPermissionEl = document.getElementById("popUpEditUserPermission");
    const popUpEditUserPermission = new PopUp(popUpEditUserPermissionEl);
    /** @type {HTMLButtonElement} */
    const btnClosePopUpEditUserPermission = document.getElementById("btnClosePopUpEditUserPermission");
    /** @type {HTMLButtonElement} */
    const btnConfirmPopUpEditUserPermission = document.getElementById("btnConfirmPopUpEditUserPermission");
    btnClosePopUpEditUserPermission.addEventListener("click", () => {
        popUpEditUserPermission.closePopUp();
    })
    const btnEditPrivilegesUser = document.querySelectorAll("button.btn-privileges-user");
    const usernameOnPopUpEditUserPerm = popUpEditUserPermissionEl.querySelector("span#username");
    /** @type {NodeListOf<HTMLInputElement>} */
    const checkboxEditPermissions = popUpEditUserPermissionEl.querySelectorAll("input[type='checkbox']");
    /** @type {null | string} User ID yang akan diubah hak izinnya */
    let editPermissionUserId = null;
    /** @type {null | string} Username yang akan diubah hak izinnya */
    let editPermissionUsername = null;
    btnEditPrivilegesUser.forEach((btn) => {
        btn.addEventListener("click", function () {
            btnConfirmPopUpEditUserPermission.disabled = true;
            const userRow = this.closest("tr.user-row");
            const { id, username, permissions } = JSON.parse(userRow.dataset.user);
            const permissionArray = permissions.split(",");
            permissionArray.forEach((perm) => {
                document.querySelector(`input[type='checkbox'][data-permission-name='${perm}']`).checked = true;
            });
            editPermissionUserId = id;
            editPermissionUsername = username;
            usernameOnPopUpEditUserPerm.textContent = username;
            popUpEditUserPermission.showPopUp();
        })
    });
    checkboxEditPermissions.forEach((cb) => {
        cb.addEventListener("change", () => {
            btnConfirmPopUpEditUserPermission.removeAttribute("disabled");
        });
    })
    btnConfirmPopUpEditUserPermission.addEventListener("click", function () {
        /** @type {HTMLButtonElement} */
        const currBtn = this;
        btnClosePopUpEditUserPermission.disabled = true;
        // __COMMENT__ Animasi loading state
        currBtn.disabled = true;
        currBtn.innerHTML = loadingSvg + "Sebentar";
        console.log(`Sedang mengubah hak izin user dengan ID ${editPermissionUserId}...`);
        // __COMMENT__ State ketika telah mendapatkan response dari server
        /**
         * Saat server mengembalikan response OK, server harus memberikan list user yg terbaru 
         */
        setTimeout(() => {
            currBtn.innerText = textBtnEditUserDefault;
            currBtn.removeAttribute("disabled");
            popUpEditUserPermission.closePopUp();
            btnClosePopUpEditUserPermission.removeAttribute("disabled");
            notification.success(`Hak izin user ${editPermissionUsername} berhasil diperbarui!`);
        }, 5000);
    });
});