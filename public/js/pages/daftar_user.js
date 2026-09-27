import { PopUp } from "../cores/PopUp.js";

document.addEventListener("DOMContentLoaded", () => {
    const popUpCreateUser = new PopUp(document.getElementById("popUpCreateUser"));
    const btnFormCreateUser = document.getElementById("btnFormCreateUser");
    const btnCancelCreateUser = document.getElementById("btnCancelCreateUser");
    const btnCreateUser = document.getElementById("btnCreateUser");
    btnFormCreateUser.addEventListener("click", () => {
        popUpCreateUser.showPopUp();
    });
    btnCancelCreateUser.addEventListener("click", () => popUpCreateUser.closePopUp());
    btnCreateUser.addEventListener("click", () => {
        console.log("Menambahkan user...")
    });
    const btnEditUser = document.querySelectorAll("button.btn-edit-user");
    const btnClosePopUpEditUser = document.getElementById('btnClosePopUpEditUser');
    const inputEditUsername = document.getElementById('editUsername');
    const inputEditEmail = document.getElementById('editEmail');
    const btnConfirmPopUpEditUser = document.getElementById("btnConfirmPopUpEditUser");
    const popUpEditUserWindow = document.getElementById('popUpEditUser');
    const popUpEditUser = new PopUp(popUpEditUserWindow);
    /** @type {Number|null} User ID yang akan diedit */
    let editUserId = null;
    btnEditUser.forEach(btn => {
        btn.addEventListener("click", function () {
            /** @type {HTMLElement} */
            const currBtn = this;
            const { id, username, email } = JSON.parse(currBtn.closest("tr.user-row").dataset.user);
            popUpEditUser.showPopUp();
            inputEditUsername.value = username;
            inputEditEmail.value = email;
            editUserId = id;
        });
    });
    btnClosePopUpEditUser.addEventListener("click", () => {
        inputEditUsername.value = '';
        inputEditEmail.value = '';
        editUserId = null;
        popUpEditUser.closePopUp();
    });
    btnConfirmPopUpEditUser.addEventListener("click", function () {
        if (editUserId === null) return;
        popUpEditUser.closePopUp();
        console.log(`Sedang mengedit user dengan ID ${editUserId}...`);
    });
    const btnDeleteUser = document.querySelectorAll("button.btn-delete-user");
    const popUpDeleteUser = new PopUp(document.getElementById("confirm"));
    btnDeleteUser.forEach(btn => {
        btn.addEventListener("click", async function () {
            /** @type {HTMLElement} */
            const currBtn = this;
            const getUserId = currBtn.dataset.userId;
            const { confirmed, closed } = await popUpDeleteUser.openPopUpConfirm({ header: "Apakah Anda yakin ingin menghapus user?" });
            if (closed) {
                popUpDeleteUser.closePopUp();
            }
            if (confirmed) {
                popUpDeleteUser.closePopUp();
                console.log(`Sedang menghapus user dengan ID ${getUserId}...`)
            }
        });
    });
});