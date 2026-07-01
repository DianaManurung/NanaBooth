// ===== Splash Screen cleanup (animasi diatur lewat CSS) =====
const splashScreen = document.getElementById("splashScreen");

if (splashScreen) {
    splashScreen.addEventListener("animationend", () => {
        splashScreen.style.display = "none";
    });
}

// ===== QR Download Modal =====
const qrModal = document.getElementById("qrModal");
const qrImage = document.getElementById("qrImage");
const qrClose = document.getElementById("qrClose");

function showQrModal(filename) {
    if (!qrModal || !qrImage) return;
    // cache-bust supaya QR selalu refresh tiap strip baru
    qrImage.src = `/qrcode/${filename}?t=${Date.now()}`;
    qrModal.classList.add("active");
}

if (qrClose) {
    qrClose.addEventListener("click", () => qrModal.classList.remove("active"));
}

if (qrModal) {
    qrModal.addEventListener("click", (e) => {
        if (e.target === qrModal) qrModal.classList.remove("active");
    });
}

const retakeButton = document.getElementById("retake");
const downloadButton = document.getElementById("download");
const cameraStatus = document.getElementById("cameraStatus");

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const stripCanvas = document.getElementById("stripCanvas");
const photo = document.getElementById("photo");

const startButton = document.getElementById("startCamera");
const captureButton = document.getElementById("capture");

const countdown = document.getElementById("countdown");
const flash = document.getElementById("flash");

const stripOptions = document.getElementById("stripOptions");
const themeOptions = document.getElementById("themeOptions");
const frameOptions = document.getElementById("frameOptions");
const shotIndicator = document.getElementById("shotIndicator");

const printBtn = document.getElementById("printBtn");
const printSizeSelect = document.getElementById("printSize");
const printImage = document.getElementById("printImage");

const PLACEHOLDER_SRC =
    "https://placehold.co/500x900/F3F4F6/9CA3AF?text=Your+Strip+Will+Appear+Here";

// Bingkai/frame overlay — digambar di layer paling atas, terpisah dari tema
const FRAMES = [
    { id: "none" },
    { id: "gold" },
    { id: "black" },
    { id: "dashed" },
    { id: "floral" },
    { id: "polaroid" }
];

// 11 tema photostrip — tiap tema punya dekorasi & gaya berbeda, bukan cuma warna
const THEMES = [
    { id: "school",     name: "School",        bg: "#EEF2F8", border: "#2F4B7C", text: "#1B2A41", accent: "#3D5A80", label: "STUDENT MEMORIES",  brandFont: "700 30px 'Plus Jakarta Sans', sans-serif" },
    { id: "classic",    name: "Classic Black",  bg: "#FFFFFF", border: "#111111", text: "#111111", accent: "#444444", label: "EST. 2026",          brandFont: "700 32px 'Plus Jakarta Sans', sans-serif" },
    { id: "couple",     name: "Couple",         bg: "#FFF0F3", border: "#E0607E", text: "#5C2A35", accent: "#C94F6D", label: "TOGETHER FOREVER",   brandFont: "italic 600 34px 'Cormorant Garamond', serif" },
    { id: "film",       name: "Film",           bg: "#1C1C1C", border: "#F4A300", text: "#F5F1E8", accent: "#F4A300", label: "35mm  •  ISO 400",   brandFont: "700 26px 'Plus Jakarta Sans', sans-serif" },
    { id: "graduation", name: "Graduation",     bg: "#F7F3E9", border: "#143057", text: "#143057", accent: "#C9A227", label: "CLASS OF 2026",      brandFont: "italic 600 32px 'Cormorant Garamond', serif" },
    { id: "birthday",   name: "Birthday",       bg: "#FFF7E8", border: "#FF6F91", text: "#5A3A24", accent: "#FFB347", label: "HAPPY BIRTHDAY",     brandFont: "700 30px 'Plus Jakarta Sans', sans-serif" },
    { id: "christmas",  name: "Christmas",      bg: "#F4FBF5", border: "#B3261E", text: "#1B4332", accent: "#2D6A4F", label: "MERRY & BRIGHT",     brandFont: "italic 600 32px 'Cormorant Garamond', serif" },
    { id: "sakura",     name: "Sakura",         bg: "#FFF4F7", border: "#F4ACB7", text: "#6B3F4B", accent: "#E78CA0", label: "SAKURA SEASON",      brandFont: "italic 600 32px 'Cormorant Garamond', serif" },
    { id: "korean",     name: "Korean",         bg: "#FDF6F0", border: "#D8B4A0", text: "#4A3B34", accent: "#C99A85", label: "인생네컷",             brandFont: "700 28px 'Plus Jakarta Sans', sans-serif" },
    { id: "polaroid",   name: "Polaroid",       bg: "#FFFFFF", border: "#D1D1D1", text: "#333333", accent: "#888888", label: "shake it like a polaroid", brandFont: "italic 600 26px 'Cormorant Garamond', serif" },
    { id: "magazine",   name: "Magazine",       bg: "#FFFFFF", border: "#000000", text: "#000000", accent: "#E10600", label: "ISSUE No.01",        brandFont: "900 34px 'Plus Jakarta Sans', sans-serif" },
    { id: "beach",       name: "Beach",         bg: "#E8F6F8", border: "#3FA9C9", text: "#1B4B5A", accent: "#F4A93C", label: "SUN, SAND & SMILES", brandFont: "italic 600 32px 'Cormorant Garamond', serif" }
];

let selectedCount = 4;
let selectedTheme = 0;
let selectedFrame = 0;
let sessionPhotos = [];
let baseStripDataUrl = null; // hasil strip + tema, sebelum frame ditempel
let isBusy = false;

renderShotIndicator();

// ===== Frame selector =====
frameOptions.addEventListener("click", (e) => {

    const btn = e.target.closest(".frame-opt");
    if (!btn || isBusy) return;

    frameOptions.querySelectorAll(".frame-opt").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    selectedFrame = parseInt(btn.dataset.frame, 10);

    // Kalau sudah ada strip jadi, ganti frame langsung tanpa ulang sesi foto
    if (baseStripDataUrl) {
        reapplyFrame();
    }

});

// ===== Theme selector =====
themeOptions.addEventListener("click", (e) => {

    const btn = e.target.closest(".theme-opt");
    if (!btn || isBusy) return;

    themeOptions.querySelectorAll(".theme-opt").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    selectedTheme = parseInt(btn.dataset.theme, 10);

});

// ===== Strip count selector =====
stripOptions.addEventListener("click", (e) => {

    const btn = e.target.closest(".strip-opt");
    if (!btn || isBusy) return;

    stripOptions.querySelectorAll(".strip-opt").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    selectedCount = parseInt(btn.dataset.count, 10);
    renderShotIndicator();

});

function renderShotIndicator() {

    shotIndicator.innerHTML = "";

    for (let i = 0; i < selectedCount; i++) {
        const dot = document.createElement("span");
        shotIndicator.appendChild(dot);
    }

}

// ===== Nyalakan Kamera =====
startButton.addEventListener("click", async () => {

    try {

        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" },
            audio: false
        });

        video.srcObject = stream;

        cameraStatus.innerHTML = "🟢 Camera Ready";
        cameraStatus.className = "status online";

    } catch (err) {

        alert("Kamera tidak bisa diakses!");
        console.error(err);

    }

});

// ===== Tombol Capture =====
captureButton.addEventListener("click", () => {

    if (!video.srcObject) {
        alert("Silakan nyalakan kamera terlebih dahulu!");
        return;
    }

    if (isBusy) return;

    startSession();

});

// ===== Sesi multi-shot =====
async function startSession() {

    isBusy = true;
    sessionPhotos = [];
    renderShotIndicator();

    for (let i = 0; i < selectedCount; i++) {

        await runCountdown(i + 1);
        flashScreen();
        const dataUrl = capturePhotoFrame();
        sessionPhotos.push(dataUrl);
        markShotDone(i);

        cameraStatus.innerHTML = `🟠 Shot ${i + 1} of ${selectedCount}`;
        cameraStatus.className = "status capturing";

        if (i < selectedCount - 1) {
            await wait(900);
        }

    }

    cameraStatus.innerHTML = "🟡 Composing strip...";
    cameraStatus.className = "status capturing";

    baseStripDataUrl = await buildStrip(sessionPhotos, THEMES[selectedTheme]);

    const finalDataUrl = await applyFrame(baseStripDataUrl, FRAMES[selectedFrame]);
    photo.src = finalDataUrl;

    await savePhoto(finalDataUrl);

    isBusy = false;

}

// ===== Ganti frame tanpa mengulang sesi foto =====
async function reapplyFrame() {

    if (!baseStripDataUrl) return;

    cameraStatus.innerHTML = "🟡 Applying frame...";
    cameraStatus.className = "status capturing";

    const finalDataUrl = await applyFrame(baseStripDataUrl, FRAMES[selectedFrame]);
    photo.src = finalDataUrl;

    await savePhoto(finalDataUrl);

}

function markShotDone(index) {
    const dots = shotIndicator.querySelectorAll("span");
    if (dots[index]) dots[index].classList.add("done");
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ===== Countdown sebelum tiap jepretan =====
function runCountdown(shotNumber) {

    return new Promise(resolve => {

        cameraStatus.innerHTML = `🟠 Get ready (${shotNumber}/${selectedCount})`;
        cameraStatus.className = "status capturing";

        let number = 3;

        countdown.style.display = "block";
        countdown.innerHTML = number;

        const timer = setInterval(() => {

            number--;

            if (number > 0) {

                countdown.innerHTML = number;

            } else {

                clearInterval(timer);
                countdown.style.display = "none";
                resolve();

            }

        }, 700);

    });

}

// ===== Efek Flash =====
function flashScreen() {

    flash.style.opacity = 1;

    setTimeout(() => {
        flash.style.opacity = 0;
    }, 150);

}

// ===== Ambil satu frame dari video =====
function capturePhotoFrame() {

    const context = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // mirror, biar sesuai apa yang dilihat di preview
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0);
    context.setTransform(1, 0, 0, 1, 0, 0);

    return canvas.toDataURL("image/png");

}

// ===== Susun jadi photostrip bertema =====
function buildStrip(photos, theme) {

    const frameW = 560;
    const sideMargin = 36;
    const gap = 18;
    const photoW = frameW - sideMargin * 2;
    const photoH = Math.round(photoW * 0.75); // rasio 4:3

    // header berbeda tinggi per tema (mis. Magazine pakai masthead tebal)
    const topMargin = theme.id === "magazine" ? 78 : (theme.id === "polaroid" ? 46 : 56);
    const footerH = theme.id === "magazine" ? 128 : 134;

    // Polaroid: tiap foto punya bingkai putih tebal di bawah, jadi cell lebih tinggi
    const cellExtra = theme.id === "polaroid" ? 34 : 0;
    const cellH = photoH + cellExtra;

    const totalH =
        topMargin +
        photos.length * cellH +
        (photos.length - 1) * gap +
        footerH;

    stripCanvas.width = frameW;
    stripCanvas.height = totalH;

    const ctx = stripCanvas.getContext("2d");

    // Background dasar
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, frameW, totalH);

    // Dekorasi tersebar khas tema (di belakang foto)
    drawScatterDecor(ctx, frameW, totalH, theme, "back");

    // Header tema (masthead / label kecil di atas)
    drawHeader(ctx, frameW, topMargin, theme);

    // Border luar
    ctx.lineWidth = theme.id === "magazine" || theme.id === "classic" ? 4 : 3;
    ctx.strokeStyle = theme.border;
    ctx.strokeRect(8, 8, frameW - 16, totalH - 16);

    // Bingkai sprocket ala roll film di kedua sisi
    if (theme.id === "film") {
        drawSprockets(ctx, frameW, totalH);
    }

    let y = topMargin;

    const drawImage = (imgEl) => {

        const srcRatio = imgEl.width / imgEl.height;
        const dstRatio = photoW / photoH;

        let sx, sy, sw, sh;

        if (srcRatio > dstRatio) {
            sh = imgEl.height;
            sw = sh * dstRatio;
            sx = (imgEl.width - sw) / 2;
            sy = 0;
        } else {
            sw = imgEl.width;
            sh = sw / dstRatio;
            sx = 0;
            sy = (imgEl.height - sh) / 2;
        }

        if (theme.id === "polaroid") {

            // bingkai putih instax-style dengan ruang kosong di bawah
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(sideMargin - 10, y - 10, photoW + 20, cellH + 10);
            ctx.strokeStyle = "#E5E5E5";
            ctx.lineWidth = 1;
            ctx.strokeRect(sideMargin - 10, y - 10, photoW + 20, cellH + 10);

        }

        ctx.drawImage(imgEl, sx, sy, sw, sh, sideMargin, y, photoW, photoH);

        // bingkai tiap foto sesuai gaya tema
        if (theme.id === "magazine") {
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 3;
            ctx.strokeRect(sideMargin, y, photoW, photoH);
        } else if (theme.id === "korean") {
            roundRectStroke(ctx, sideMargin, y, photoW, photoH, 14, theme.border + "AA", 2);
        } else {
            ctx.strokeStyle = theme.border + "59";
            ctx.lineWidth = 1;
            ctx.strokeRect(sideMargin, y, photoW, photoH);
        }

        y += cellH + gap;

    };

    return new Promise((resolve) => {

        let loaded = 0;
        const imgs = photos.map(() => new Image());

        imgs.forEach((imgEl, idx) => {

            imgEl.onload = () => {
                loaded++;
                if (loaded === imgs.length) {

                    imgs.forEach(im => drawImage(im));
                    drawScatterDecor(ctx, frameW, totalH, theme, "front");
                    drawFooter(ctx, frameW, totalH, footerH, theme);
                    resolve(stripCanvas.toDataURL("image/png"));

                }
            };

            imgEl.src = photos[idx];

        });

    });

}

// ===== Header / masthead khas tiap tema =====
function drawHeader(ctx, frameW, topMargin, theme) {

    ctx.textAlign = "center";

    if (theme.id === "magazine") {

        ctx.fillStyle = "#000000";
        ctx.fillRect(8, 8, frameW - 16, topMargin - 8);

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "900 26px 'Plus Jakarta Sans', sans-serif";
        ctx.fillText("N A N A B O O T H", frameW / 2, topMargin / 2 + 16);

        ctx.fillStyle = theme.accent;
        ctx.font = "700 11px 'Plus Jakarta Sans', sans-serif";
        ctx.fillText(theme.label, frameW / 2, topMargin - 10);

        return;

    }

    ctx.fillStyle = theme.accent;
    ctx.font = "700 11px 'Plus Jakarta Sans', sans-serif";
    ctx.save();
    ctx.translate(frameW / 2, topMargin / 2 + 6);
    ctx.fillText(addLetterSpacing(theme.label), 0, 0);
    ctx.restore();

    if (theme.id === "graduation") {
        drawCap(ctx, frameW / 2 - 70, topMargin / 2 - 6, 16, theme.accent);
        drawCap(ctx, frameW / 2 + 70, topMargin / 2 - 6, 16, theme.accent);
    }

    if (theme.id === "couple") {
        drawHeart(ctx, frameW / 2 - 60, topMargin / 2, 8, theme.accent);
        drawHeart(ctx, frameW / 2 + 60, topMargin / 2, 8, theme.accent);
    }

    if (theme.id === "christmas") {
        drawSnowflake(ctx, frameW / 2 - 65, topMargin / 2, 9, theme.border);
        drawSnowflake(ctx, frameW / 2 + 65, topMargin / 2, 9, theme.border);
    }

    if (theme.id === "sakura") {
        drawPetal(ctx, frameW / 2 - 65, topMargin / 2, 9, theme.border);
        drawPetal(ctx, frameW / 2 + 65, topMargin / 2, 9, theme.border);
    }

    if (theme.id === "birthday") {
        drawStar(ctx, frameW / 2 - 65, topMargin / 2, 8, theme.accent);
        drawStar(ctx, frameW / 2 + 65, topMargin / 2, 8, theme.accent);
    }

    if (theme.id === "korean") {
        drawStarOutline(ctx, frameW / 2 - 65, topMargin / 2, 7, theme.accent);
        drawStarOutline(ctx, frameW / 2 + 65, topMargin / 2, 7, theme.accent);
    }

    if (theme.id === "beach") {
        drawSun(ctx, frameW / 2 - 65, topMargin / 2, 9, theme.accent);
        drawSun(ctx, frameW / 2 + 65, topMargin / 2, 9, theme.accent);
    }

}

function addLetterSpacing(text) {
    return text.split("").join(String.fromCharCode(8202));
}

// ===== Dekorasi tersebar (confetti / petal / snowflake dst) =====
function drawScatterDecor(ctx, frameW, totalH, theme, layer) {

    const seedPositions = [
        [0.10, 0.20], [0.90, 0.18], [0.08, 0.55], [0.92, 0.50],
        [0.12, 0.85], [0.88, 0.82], [0.50, 0.06]
    ];

    if (theme.id === "birthday" && layer === "back") {
        const colors = ["#FF6F91", "#FFB347", "#9AD0C2", "#9C8FE0"];
        seedPositions.forEach(([px, py], i) => {
            drawConfetti(ctx, px * frameW, py * totalH, 6, colors[i % colors.length]);
        });
    }

    if (theme.id === "christmas" && layer === "back") {
        seedPositions.forEach(([px, py]) => {
            drawSnowflake(ctx, px * frameW, py * totalH, 7, theme.border + "70");
        });
    }

    if (theme.id === "sakura" && layer === "back") {
        seedPositions.forEach(([px, py]) => {
            drawPetal(ctx, px * frameW, py * totalH, 8, theme.border + "80");
        });
    }

    if (theme.id === "korean" && layer === "front") {
        drawHeart(ctx, frameW - 30, totalH - 30, 7, theme.accent);
    }

    if (theme.id === "beach" && layer === "back") {
        drawWaveBand(ctx, frameW, totalH * 0.93, theme.border + "55");
        seedPositions.slice(0, 4).forEach(([px, py]) => {
            drawShell(ctx, px * frameW, py * totalH, 6, theme.accent + "AA");
        });
    }

}

// ===== Helper shapes =====
function drawHeart(ctx, x, y, size, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y + size / 4);
    ctx.bezierCurveTo(x, y, x - size, y, x - size, y + size / 4);
    ctx.bezierCurveTo(x - size, y + size, x, y + size * 1.3, x, y + size * 1.6);
    ctx.bezierCurveTo(x, y + size * 1.3, x + size, y + size, x + size, y + size / 4);
    ctx.bezierCurveTo(x + size, y, x, y, x, y + size / 4);
    ctx.fill();
}

function drawStar(ctx, x, y, size, color) {
    ctx.fillStyle = color;
    drawStarPath(ctx, x, y, size);
    ctx.fill();
}

function drawStarOutline(ctx, x, y, size, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.4;
    drawStarPath(ctx, x, y, size);
    ctx.stroke();
}

function drawStarPath(ctx, x, y, size) {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
        const angle2 = angle + Math.PI / 5;
        const xOuter = x + size * Math.cos(angle);
        const yOuter = y + size * Math.sin(angle);
        const xInner = x + (size / 2.4) * Math.cos(angle2);
        const yInner = y + (size / 2.4) * Math.sin(angle2);
        if (i === 0) ctx.moveTo(xOuter, yOuter); else ctx.lineTo(xOuter, yOuter);
        ctx.lineTo(xInner, yInner);
    }
    ctx.closePath();
}

function drawSnowflake(ctx, x, y, size, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.3;
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + size * Math.cos(angle), y + size * Math.sin(angle));
        ctx.stroke();
    }
}

function drawPetal(ctx, x, y, size, color) {
    ctx.fillStyle = color;
    for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 * i) / 5;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.ellipse(0, -size * 0.6, size * 0.45, size * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function drawConfetti(ctx, x, y, size, color) {
    ctx.fillStyle = color;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.random() * Math.PI);
    ctx.fillRect(-size / 2, -size / 4, size, size / 2);
    ctx.restore();
}

function drawSun(ctx, x, y, size, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.55, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 8; i++) {
        const angle = (Math.PI / 4) * i;
        ctx.beginPath();
        ctx.moveTo(x + size * 0.8 * Math.cos(angle), y + size * 0.8 * Math.sin(angle));
        ctx.lineTo(x + size * 1.25 * Math.cos(angle), y + size * 1.25 * Math.sin(angle));
        ctx.stroke();
    }
}

function drawWaveBand(ctx, frameW, y, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    const amplitude = 6;
    const waveLength = 40;
    ctx.moveTo(0, y);
    for (let x = 0; x <= frameW; x += 2) {
        ctx.lineTo(x, y + Math.sin(x / waveLength) * amplitude);
    }
    ctx.stroke();
}

function drawShell(ctx, x, y, size, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i <= 6; i++) {
        const angle = Math.PI + (Math.PI * i) / 6;
        const r = size * (i % 2 === 0 ? 1 : 0.6);
        const px = x + r * Math.cos(angle);
        const py = y + r * Math.sin(angle) * 0.7;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
}

function drawCap(ctx, x, y, size, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x - size, y);
    ctx.lineTo(x, y - size * 0.5);
    ctx.lineTo(x + size, y);
    ctx.lineTo(x, y + size * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(x - 2, y, 4, size * 0.7);
}

function drawSprockets(ctx, frameW, totalH) {
    ctx.fillStyle = "#0F0F0F";
    const holeSize = 8;
    const gapY = 26;
    for (let y = 24; y < totalH - 24; y += gapY) {
        roundRectFill(ctx, 14, y, holeSize, holeSize, 2, "#0F0F0F");
        roundRectFill(ctx, frameW - 14 - holeSize, y, holeSize, holeSize, 2, "#0F0F0F");
    }
}

function roundRectFill(ctx, x, y, w, h, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.fill();
}

function roundRectStroke(ctx, x, y, w, h, r, color, lineWidth) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.stroke();
}

function drawFooter(ctx, frameW, totalH, footerH, theme) {

    const footerY = totalH - footerH;

    // garis pemisah tipis sebelum footer
    ctx.strokeStyle = theme.border + "80";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(36, footerY);
    ctx.lineTo(frameW - 36, footerY);
    ctx.stroke();

    // Judul brand, font berbeda tiap tema
    ctx.fillStyle = theme.text;
    ctx.textAlign = "center";
    ctx.font = theme.brandFont;
    ctx.fillText("NanaBooth", frameW / 2, footerY + 50);

    // Label tema kecil
    ctx.fillStyle = theme.accent;
    ctx.font = "600 11px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(theme.label, frameW / 2, footerY + 74);

    // Tanggal
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });

    ctx.fillStyle = theme.text + "99";
    ctx.font = "500 11px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(dateStr.toUpperCase(), frameW / 2, footerY + 94);

    // ikon penutup khas tema
    const iconY = footerY + 112;
    const cx = frameW / 2;

    switch (theme.id) {
        case "couple":
            drawHeart(ctx, cx, iconY - 5, 7, theme.accent);
            break;
        case "christmas":
            drawSnowflake(ctx, cx, iconY, 8, theme.border);
            break;
        case "sakura":
            drawPetal(ctx, cx, iconY, 7, theme.border);
            break;
        case "birthday":
            drawStar(ctx, cx - 14, iconY, 5, theme.accent);
            drawStar(ctx, cx, iconY - 4, 6, theme.accent);
            drawStar(ctx, cx + 14, iconY, 5, theme.accent);
            break;
        case "graduation":
            drawCap(ctx, cx, iconY, 10, theme.accent);
            break;
        case "korean":
            drawStarOutline(ctx, cx, iconY, 6, theme.accent);
            break;
        case "beach":
            drawSun(ctx, cx, iconY, 7, theme.accent);
            break;
        default:
            ctx.fillStyle = theme.border;
            for (let i = -1; i <= 1; i++) {
                ctx.beginPath();
                ctx.arc(cx + i * 18, iconY, 2.5, 0, Math.PI * 2);
                ctx.fill();
            }
    }

}

// ===== Terapkan frame sebagai layer paling atas =====
function applyFrame(baseDataUrl, frame) {

    return new Promise((resolve) => {

        const img = new Image();

        img.onload = () => {

            stripCanvas.width = img.width;
            stripCanvas.height = img.height;

            const ctx = stripCanvas.getContext("2d");

            // gambar strip dasar (foto + tema) dulu
            ctx.drawImage(img, 0, 0);

            // baru frame ditempel di atasnya — selalu layer paling akhir
            drawFrameOverlay(ctx, img.width, img.height, frame);

            resolve(stripCanvas.toDataURL("image/png"));

        };

        img.src = baseDataUrl;

    });

}

function drawFrameOverlay(ctx, w, h, frame) {

    switch (frame.id) {

        case "gold": {
            ctx.strokeStyle = "#D6B57B";
            ctx.lineWidth = 6;
            ctx.strokeRect(10, 10, w - 20, h - 20);
            ctx.lineWidth = 2;
            ctx.strokeRect(20, 20, w - 40, h - 40);
            drawCornerDiamond(ctx, 20, 20, "#D6B57B");
            drawCornerDiamond(ctx, w - 20, 20, "#D6B57B");
            drawCornerDiamond(ctx, 20, h - 20, "#D6B57B");
            drawCornerDiamond(ctx, w - 20, h - 20, "#D6B57B");
            break;
        }

        case "black": {
            ctx.strokeStyle = "#0B0B0B";
            ctx.lineWidth = 10;
            ctx.strokeRect(5, 5, w - 10, h - 10);
            break;
        }

        case "dashed": {
            ctx.strokeStyle = "#C99A85";
            ctx.lineWidth = 4;
            ctx.setLineDash([14, 10]);
            ctx.strokeRect(14, 14, w - 28, h - 28);
            ctx.setLineDash([]);
            break;
        }

        case "floral": {
            drawPetal(ctx, 30, 30, 14, "#B79CD8AA");
            drawPetal(ctx, w - 30, 30, 14, "#B79CD8AA");
            drawPetal(ctx, 30, h - 30, 14, "#B79CD8AA");
            drawPetal(ctx, w - 30, h - 30, 14, "#B79CD8AA");
            ctx.strokeStyle = "#B79CD877";
            ctx.lineWidth = 2;
            ctx.strokeRect(16, 16, w - 32, h - 32);
            break;
        }

        case "polaroid": {
            // bingkai putih tebal ala polaroid, jadi layer terakhir di atas
            const t = 22;
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, w, t);              // atas
            ctx.fillRect(0, h - t, w, t);           // bawah
            ctx.fillRect(0, 0, t, h);               // kiri
            ctx.fillRect(w - t, 0, t, h);           // kanan
            ctx.strokeStyle = "#E5E7EB";
            ctx.lineWidth = 1;
            ctx.strokeRect(t, t, w - t * 2, h - t * 2);
            break;
        }

        // "none" -> tidak menggambar apa pun
        default:
            break;

    }

}

function drawCornerDiamond(ctx, x, y, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y - 6);
    ctx.lineTo(x + 6, y);
    ctx.lineTo(x, y + 6);
    ctx.lineTo(x - 6, y);
    ctx.closePath();
    ctx.fill();
}


function savePhoto(dataUrl) {

    return fetch("/save-photo", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            image: dataUrl
        })

    })
    .then(response => response.json())
    .then(data => {

        cameraStatus.innerHTML = "🟢 Strip Saved";
        cameraStatus.className = "status online";

        console.log("Nama File:", data.filename);

        if (data.success) {
            showQrModal(data.filename);
        }

    })
    .catch(error => {

        console.error(error);
        cameraStatus.innerHTML = "🔴 Save Failed";
        cameraStatus.className = "status offline";

    });

}

// ===== Download =====
downloadButton.addEventListener("click", () => {

    if (!photo.src || photo.src.includes("placehold.co")) {

        alert("Belum ada strip foto.");
        return;

    }

    const link = document.createElement("a");

    link.href = photo.src;
    link.download = "NanaBooth-Strip.png";
    link.click();

});

// ===== Print =====
printBtn.addEventListener("click", () => {

    if (!photo.src || photo.src.includes("placehold.co")) {
        alert("Belum ada strip foto untuk dicetak.");
        return;
    }

    printImage.src = photo.src;
    setPrintPageSize(printSizeSelect.value);

    // beri jeda singkat supaya gambar & ukuran halaman ter-apply dulu
    setTimeout(() => {
        window.print();
    }, 150);

});

function setPrintPageSize(size) {

    let pageSize = "auto";

    if (size === "2x6") pageSize = "2in 6in";
    else if (size === "4x6") pageSize = "4in 6in";
    else if (size === "a4") pageSize = "A4";

    let styleTag = document.getElementById("dynamicPrintSize");

    if (!styleTag) {
        styleTag = document.createElement("style");
        styleTag.id = "dynamicPrintSize";
        document.head.appendChild(styleTag);
    }

    styleTag.innerHTML = `@page { size: ${pageSize}; margin: 0; }`;

}

// ===== Retake =====
retakeButton.addEventListener("click", () => {

    if (isBusy) return;

    photo.src = PLACEHOLDER_SRC;
    sessionPhotos = [];
    baseStripDataUrl = null;
    renderShotIndicator();

    cameraStatus.innerHTML = video.srcObject ? "🟢 Camera Ready" : "🔴 Offline";
    cameraStatus.className = video.srcObject ? "status online" : "status offline";

});