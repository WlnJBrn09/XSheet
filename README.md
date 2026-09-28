# XSheet

Local-first spreadsheet with liquid-glass UI and a **Rust** backend.

## Desktop app (native)

No Electron. Native WebKitGTK host + local Rust backend.

```bash
npm run native:build
npm run native
npm run dist:deb   # Debian/Ubuntu .deb
npm run dist:rpm   # Fedora/RHEL/openSUSE .rpm
```

Port **8788**.

## Dev server

```bash
cargo run
```

http://127.0.0.1:8788

## Files

Open XLSX/XLSM/XLS, CSV/TSV, Parquet, and XSheet JSON. Export XLSX with values, formulas, and basic cell formatting; CSV/TSV export the active sheet. JSON export and local saves retain all sheets, styles, active sheet, and editor charts. Charts are not included in XLSX exports.

## License

MIT
