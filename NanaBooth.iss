; ============================================================
;  NanaBooth Setup Script — Inno Setup
;  Build dengan Inno Setup Compiler (ISCC.exe / Inno Setup IDE)
;  Pastikan folder dist\NanaBooth\ (hasil PyInstaller --onedir)
;  sudah ada sebelum compile script ini.
; ============================================================

#define MyAppName "NanaBooth"
#define MyAppVersion "1.0.0"
#define MyAppExeName "NanaBooth.exe"
#define MyAppPublisher "NanaBooth Studio"

[Setup]
AppId={{4F2B6E2B-9A3D-4F1E-8C1A-NANABOOTH0001}}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
DefaultDirName=D:\{#MyAppName}
DefaultGroupName={#MyAppName}
DisableProgramGroupPage=yes
PrivilegesRequired=lowest
OutputDir=installer_output
OutputBaseFilename=NanaBooth Setup
Compression=lzma
SolidCompression=yes
WizardStyle=modern
UninstallDisplayIcon={app}\{#MyAppExeName}
ArchitecturesInstallIn64BitMode=x64compatible
; Kalau punya file ikon sendiri, aktifkan baris di bawah ini:
; SetupIconFile=icon.ico

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "Create a &desktop shortcut"; GroupDescription: "Additional icons:"
Name: "startmenuicon"; Description: "Create a &Start Menu shortcut"; GroupDescription: "Additional icons:"; Flags: unchecked

[Files]
; PyInstaller --onedir menghasilkan folder dist\NanaBooth\ berisi
; NanaBooth.exe + folder _internal\ (DLL & dependency).
; "*" + recursesubdirs nge-copy SEMUA isinya, termasuk _internal.
Source: "dist\NanaBooth\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Dirs]
; Bikin folder NanaBooth + sub-folder penyimpanan gallery/uploads dari awal,
; dan beri izin tulis penuh supaya foto baru selalu bisa tersimpan.
Name: "{app}";                  Permissions: users-modify
Name: "{app}\static";           Permissions: users-modify
Name: "{app}\static\uploads";   Permissions: users-modify
Name: "{app}\templates";        Permissions: users-modify

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{commondesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon
Name: "{userstartmenu}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: startmenuicon

[Run]
; Setelah instalasi selesai, langsung jalankan NanaBooth otomatis.
Filename: "{app}\{#MyAppExeName}"; Description: "Launch {#MyAppName}"; Flags: nowait postinstall skipifsilent

[UninstallDelete]
; Opsional: hapus juga folder templates/static (termasuk gallery/uploads)
; saat user uninstall. Hapus comment ";" di bawah ini kalau mau perilaku ini.
; Type: filesandordirs; Name: "{app}\static"
; Type: filesandordirs; Name: "{app}\templates"
