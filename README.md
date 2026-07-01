# 📸 NanaBooth

> Aplikasi photobooth desktop elegan berbasis Flask & Python — capture, compose, dan download photostrip langsung dari laptopmu.

![Python](https://img.shields.io/badge/Python-3.13-blue?logo=python)
![Flask](https://img.shields.io/badge/Flask-3.x-black?logo=flask)
![Platform](https://img.shields.io/badge/Platform-Windows-blue?logo=windows)

---

## ✨ Fitur

| Fitur | Keterangan |
|---|---|
| 📷 Live Camera | Akses webcam langsung dari aplikasi |
| 🎞️ Photostrip | Buat strip 2–6 foto sekaligus dengan countdown otomatis |
| 🎨 12 Tema | School, Classic Black, Couple, Film, Graduation, Birthday, Christmas, Sakura, Korean, Polaroid, Magazine, Beach |
| 🖼️ 6 Frame | Gold, Bold Black, Dashed, Floral, Polaroid, None — bisa diganti tanpa ulang sesi foto |
| 🗃️ Gallery | Simpan, preview, download ulang, delete, dan print semua photostrip |
| 🖨️ Print | Cetak strip ukuran 2×6 in, 4×6 in, atau A4 |
| 📲 QR Download | Scan QR Code dari HP untuk langsung download strip |
| 💫 Splash Screen | Animasi loading elegan saat aplikasi dibuka |
| 🖥️ Desktop App | Berjalan sebagai aplikasi desktop via pywebview (tanpa browser) |
| 📦 Installer | Bisa diinstall via `NanaBooth Setup.exe` (Inno Setup) |

---

## 🗂️ Struktur Folder

```
NanaBooth/
├── app.py                  # Backend Flask (semua route)
├── launcher.py             # Launcher desktop (pywebview)
├── requirements.txt        # Daftar dependency Python
├── NanaBooth.iss           # Script installer Inno Setup
├── templates/
│   ├── index.html          # Halaman utama
│   └── gallery.html        # Halaman gallery
└── static/
    ├── css/
    │   ├── style.css       # Style halaman utama
    │   └── gallery.css     # Style halaman gallery
    ├── js/
    │   ├── script.js       # Logic kamera, strip, tema, frame, QR
    │   └── gallery.js      # Logic gallery
    └── uploads/            # Folder hasil photostrip (auto-dibuat)
```

---

## 🚀 Cara Menjalankan (Development)

### 1. Clone repository
```bash
git clone https://github.com/DianaManurung/NanaBooth.git
cd NanaBooth
```

### 2. Buat virtual environment
```bash
python -m venv venv
venv\Scripts\activate
```

### 3. Install dependency
```bash
pip install -r requirements.txt
```

### 4. Jalankan sebagai web app biasa
```bash
python app.py
```
Buka browser ke `http://127.0.0.1:5000`

### 5. Atau jalankan sebagai desktop app
```bash
python launcher.py
```

---

## 📦 Build ke `.exe` (PyInstaller)

```bash
pyinstaller --noconfirm --onedir --windowed --name NanaBooth ^
  --add-data "templates;templates" ^
  --add-data "static;static" ^
  launcher.py
```

Hasilnya ada di `dist\NanaBooth\NanaBooth.exe`.

---

## 🪟 Buat Installer Windows (Inno Setup)

1. Install [Inno Setup](https://jrsoftware.org/isinfo.php)
2. Pastikan folder `dist\NanaBooth\` sudah ada (hasil build PyInstaller)
3. Buka `NanaBooth.iss` di Inno Setup → klik **Compile**
4. Hasilnya: `installer_output\NanaBooth Setup.exe`

---

## 🛠️ Tech Stack

- **Backend** — Python, Flask
- **Frontend** — HTML5, CSS3, JavaScript (Vanilla), HTML5 Canvas API
- **Desktop** — pywebview (WebView2/EdgeChromium)
- **Build** — PyInstaller, Inno Setup
- **QR Code** — qrcode[pil]

---

## 📋 Requirements

```
Flask
qrcode[pil]
pywebview
pyinstaller
```

---

## 👩‍💻 Author

**Diana Manurung**  
Universitas — Tugas Kuliah PhotoBooth  
© 2026 NanaBooth
