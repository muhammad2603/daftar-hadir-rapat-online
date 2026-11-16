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
let lastWidth = 0;

const resizeCanvas = () => {
    if (!canvas.offsetWidth) return;
    if (canvas.offsetWidth === lastWidth) return;
    lastWidth = canvas.offsetWidth;
    const data = signaturePad.toData();
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext('2d').scale(ratio, ratio);
    signaturePad.clear();
    if (data.length) {
        signaturePad.fromData(data);
        signatureDataUrl = signaturePad.toDataURL();
    }
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

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