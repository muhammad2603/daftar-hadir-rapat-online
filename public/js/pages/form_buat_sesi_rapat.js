document.addEventListener("DOMContentLoaded", () => {
    /** @type {HTMLButtonElement} */
    const btnCreate = document.getElementById("create");
    btnCreate.addEventListener("click", function () {
        console.log("Tombol submit diklik!")
    });
});