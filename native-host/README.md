# XSheet — Native Windows host

Thin Win32 desktop shell that **does not use Electron**. It spawns the existing Rust backend (`xsheet.exe`), waits for `GET /api/health`, and loads the product UI in a **WebView2** window.

## Prerequisites

- Rust toolchain (MSVC)
- Microsoft Edge **WebView2** Runtime
- Backend: `cargo build --release` from `xsheet/`

## Build / Run

From `xsheet/`:

```bat
npm run native:build
npm run native
```

Binary: `native-host/target/release/xsheet-native.exe`
Default port: **8788**

Headless:

```bat
set XSHEET_NATIVE_HEADLESS_SECS=20
native-host\target\release\xsheet-native.exe --headless
```

## Packaging

```bat
npm run dist
```

`dist/XSheet_v*_win.zip`. macOS/Linux via CI (`.github/workflows/native.yml`).
