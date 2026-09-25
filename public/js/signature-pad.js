import SignaturePad from './libs/signature_pad/dist/signature_pad.min.js';

const canvas = document.querySelector("canvas");
const ttdText = document.getElementById("ttdText");
const resetTtdBtn = document.getElementById("resetTtd");

const disableSignaturePadAtEnd = () => {
    signaturePad.off();
    resetTtdBtn.classList.add("flex");
    resetTtdBtn.classList.remove("hidden");
    canvas.classList.remove("cursor-pen-tool");
};

const enableSignaturePad = () => {
    signaturePad.clear();
    canvas.classList.add("cursor-pen-tool");
    ttdText.classList.remove("hidden");
    signaturePad.on();
    resetTtdBtn.classList.remove("flex");
    resetTtdBtn.classList.add("hidden");
};

const signaturePad = new SignaturePad(canvas, {
    minWidth: 0.8
});
let signatureDataUrl = null;

signaturePad.addEventListener("beginStroke", () => {
    ttdText.classList.add("hidden");
});

signaturePad.addEventListener("endStroke", () => {
    disableSignaturePadAtEnd();
    signatureDataUrl = signaturePad.toDataURL();
});

resetTtdBtn.addEventListener("click", () => {
    enableSignaturePad();
    signatureDataUrl = null;
});