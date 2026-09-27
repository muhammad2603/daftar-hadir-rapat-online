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
});