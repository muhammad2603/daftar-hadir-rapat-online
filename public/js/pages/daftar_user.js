import { PopUp } from "../cores/PopUp.js";

const loadingSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-loader-circle preview-icon size-4 animate-spin">
<path d="M21 12a9 9 0 1 1-6.219-8.56"/>
</svg>`;

const loadingSvgSmall = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-loader-circle preview-icon size-3.5 animate-spin">
<path d="M21 12a9 9 0 1 1-6.219-8.56"/>
</svg>`;

document.addEventListener("DOMContentLoaded", () => {
    const popUpCreateUser = new PopUp(document.getElementById("popUpCreateUser"));
    const btnFormCreateUser = document.getElementById("btnFormCreateUser");
    const btnCancelCreateUser = document.getElementById("btnCancelCreateUser");
    const btnCreateUser = document.getElementById("btnCreateUser");
    const textBtnCreateUser = btnCreateUser.innerText;
    btnFormCreateUser.addEventListener("click", () => {
        popUpCreateUser.showPopUp();
    });
    btnCancelCreateUser.addEventListener("click", () => popUpCreateUser.closePopUp());
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
            popUpCreateUser.closePopUp();
            console.log("User berhasil ditambahkan.");
        }, 5000);
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
            console.log(`Berhasil mengedit user dengan ID ${editUserId}...`);
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
                    console.log(`User dengan ID ${getUserId} berhasil dihapus.`);
                }, 5000);
            }
        });
    });
});