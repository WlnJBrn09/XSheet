(() => {
  'use strict';

  const API = '/api';
  const BASE_COL_W = 100;
  const BASE_ROW_H = 22;
  const DEFAULT_ROWS = 100;
  const DEFAULT_COLS = 26;
  const DEFAULT_FONT = 'Inter';
  const DEFAULT_SIZE = 10;
  const DEFAULT_CURRENCY = 'USD';

  const PALETTE = [
    '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
    '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
    '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc',
    '#dd7e6b', '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#a4c2f4', '#9fc5e8', '#b4a7d6', '#d5a6bd',
    '#cc4125', '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6d9eeb', '#6fa8dc', '#8e7cc3', '#c27ba0',
    '#a61c00', '#cc0000', '#e69138', '#f1c232', '#6aa84f', '#45818e', '#3c78d8', '#3d85c6', '#674ea7', '#a64d79',
    '#85200c', '#990000', '#b45f06', '#bf9000', '#38761d', '#134f5c', '#1155cc', '#0b5394', '#351c75', '#741b47',
    '#5b0f00', '#660000', '#783f04', '#7f6000', '#274e13', '#0c343d', '#1c4587', '#073763', '#20124d', '#4c1130',
  ];

  const FONT_LIST = [
    { name: 'Inter', stack: 'Inter, sans-serif' },
    { name: 'Roboto', stack: 'Roboto, sans-serif' },
    { name: 'Open Sans', stack: "'Open Sans', sans-serif" },
    { name: 'Montserrat', stack: 'Montserrat, sans-serif' },
    { name: 'Poppins', stack: 'Poppins, sans-serif' },
    { name: 'Nunito', stack: 'Nunito, sans-serif' },
    { name: 'Raleway', stack: 'Raleway, sans-serif' },
    { name: 'Work Sans', stack: "'Work Sans', sans-serif" },
    { name: 'DM Sans', stack: "'DM Sans', sans-serif" },
    { name: 'Space Grotesk', stack: "'Space Grotesk', sans-serif" },
    { name: 'IBM Plex Sans', stack: "'IBM Plex Sans', sans-serif" },
    { name: 'Ubuntu', stack: 'Ubuntu, sans-serif' },
    { name: 'Oswald', stack: 'Oswald, sans-serif' },
    { name: 'Quicksand', stack: 'Quicksand, sans-serif' },
    { name: 'Mulish', stack: 'Mulish, sans-serif' },
    { name: 'Arial', stack: 'Arial, Helvetica, sans-serif' },
    { name: 'Helvetica', stack: 'Helvetica, Arial, sans-serif' },
    { name: 'Segoe UI', stack: "'Segoe UI', Tahoma, sans-serif" },
    { name: 'Tahoma', stack: 'Tahoma, Geneva, sans-serif' },
    { name: 'Verdana', stack: 'Verdana, Geneva, sans-serif' },
    { name: 'Trebuchet MS', stack: "'Trebuchet MS', sans-serif" },
    { name: 'Calibri', stack: 'Calibri, Candara, sans-serif' },
    { name: 'Georgia', stack: 'Georgia, serif' },
    { name: 'Times New Roman', stack: "'Times New Roman', Times, serif" },
    { name: 'Merriweather', stack: 'Merriweather, serif' },
    { name: 'Lora', stack: 'Lora, serif' },
    { name: 'Source Serif 4', stack: "'Source Serif 4', serif" },
    { name: 'Playfair Display', stack: "'Playfair Display', serif" },
    { name: 'Crimson Text', stack: "'Crimson Text', serif" },
    { name: 'Libre Baskerville', stack: "'Libre Baskerville', serif" },
    { name: 'PT Serif', stack: "'PT Serif', serif" },
    { name: 'JetBrains Mono', stack: "'JetBrains Mono', monospace" },
    { name: 'IBM Plex Mono', stack: "'IBM Plex Mono', monospace" },
    { name: 'Fira Code', stack: "'Fira Code', monospace" },
    { name: 'Inconsolata', stack: 'Inconsolata, monospace' },
    { name: 'Courier New', stack: "'Courier New', Courier, monospace" },
    { name: 'Consolas', stack: 'Consolas, monospace' },
  ];

  const FONT_STACK = Object.fromEntries(FONT_LIST.map((f) => [f.name, f.stack]));

  const $ = (id) => document.getElementById(id);

  const docTitle = $('doc-title');
  const statusText = $('status-text');
  const starBtn = $('star-btn');
  const saveBtn = $('save-btn');
  const saveMenuBtn = $('save-menu-btn');
  const saveMenu = $('save-menu');
  const themeToggle = $('theme-toggle');
  const nameBox = $('name-box');
  const formulaInput = $('formula-input');
  const colHeaders = $('col-headers');
  const rowHeaders = $('row-headers');
  const gridViewport = $('grid-viewport');
  const gridCanvas = $('grid-canvas');
  const chartLayer = $('chart-layer');
  const cellEditor = $('cell-editor');
  const sheetTabs = $('sheet-tabs');
  const addSheetBtn = $('add-sheet-btn');
  const sidebarNew = $('sidebar-new');
  const sidebarOpen = $('sidebar-open');
  const fileOpenInput = $('file-open-input');
  const docList = $('doc-list');
  const docsFolderLabel = $('docs-folder-label');
  const refreshFiles = $('refresh-files');
  const zoomBtn = $('zoom-btn');
  const zoomMenu = $('zoom-menu');
  const fontBtn = $('font-btn');
  const fontMenu = $('font-menu');
  const fontLabel = $('font-label');
  const fsMinus = $('fs-minus');
  const fsPlus = $('fs-plus');
  const fsVal = $('fs-val');
  const textColorBtn = $('text-color-btn');
  const fillColorBtn = $('fill-color-btn');
  const textColBar = $('text-col-bar');
  const fillColBar = $('fill-col-bar');
  // Created in body so they are never clipped by the toolbar scroller
  let textColorPicker = null;
  let fillColorPicker = null;
  let openPopoverEl = null;
  let openPopoverBtn = null;
  const linkBtn = $('link-btn');
  const linkDialog = $('link-dialog');
  const linkText = $('link-text');
  const linkUrl = $('link-url');
  const linkApply = $('link-apply');
  const chartBtn = $('chart-btn');
  const chartMenu = $('chart-menu');
  const gridCorner = $('grid-corner');

  /** @type {{ name: string, data: string[][], styles: Record<string, object>, charts?: object[] }[]} */
  let sheets = [emptySheet('Sheet1')];
  let activeSheet = 0;
  let anchor = { r: 0, c: 0 };
  let focus = { r: 0, c: 0 };
  /** True only while primary button is held for a cell drag-select. */
  let dragSelect = false;
  let dragPointerId = null;
  let docId = null;
  let dirty = false;
  let starred = false;
  let saveTimer = null;
  let activeFilePath = null;
  let editing = false;
  let undoStack = [];
  let redoStack = [];
  let zoom = 100;
  let defaultFont = DEFAULT_FONT;
  let defaultSize = DEFAULT_SIZE;
  let chartIdSeq = 1;
  let draggingChart = null;

  function emptySheet(name) {
    return {
      name,
      data: Array.from({ length: DEFAULT_ROWS }, () =>
        Array.from({ length: DEFAULT_COLS }, () => '')
      ),
      styles: {},
      charts: [],
    };
  }

  function colW() {
    return Math.round(BASE_COL_W * (zoom / 100));
  }
  function rowH() {
    return Math.round(BASE_ROW_H * (zoom / 100));
  }

  function colLetters(c) {
    let n = c;
    let s = '';
    do {
      s = String.fromCharCode(65 + (n % 26)) + s;
      n = Math.floor(n / 26) - 1;
    } while (n >= 0);
    return s;
  }

  function cellRef(r, c) {
    return colLetters(c) + (r + 1);
  }

  function rangeLabel() {
    const a = normalizeRange();
    if (a.r1 === a.r2 && a.c1 === a.c2) return cellRef(a.r1, a.c1);
    return cellRef(a.r1, a.c1) + ':' + cellRef(a.r2, a.c2);
  }

  function normalizeRange() {
    return {
      r1: Math.min(anchor.r, focus.r),
      r2: Math.max(anchor.r, focus.r),
      c1: Math.min(anchor.c, focus.c),
      c2: Math.max(anchor.c, focus.c),
    };
  }

  function currentSheet() {
    return sheets[activeSheet] || sheets[0];
  }

  function ensureSize(sheet, rows, cols) {
    while (sheet.data.length < rows) {
      sheet.data.push(Array.from({ length: Math.max(cols, DEFAULT_COLS) }, () => ''));
    }
    for (const row of sheet.data) {
      while (row.length < cols) row.push('');
    }
  }

  function getCell(r, c) {
    const s = currentSheet();
    if (!s.data[r] || s.data[r][c] == null) return '';
    return s.data[r][c];
  }

  function setCell(r, c, val, { pushUndo = true } = {}) {
    const s = currentSheet();
    ensureSize(s, r + 1, c + 1);
    const prev = s.data[r][c] || '';
    if (prev === val) return;
    if (pushUndo) {
      undoStack.push({ type: 'cell', r, c, prev, next: val, sheet: activeSheet });
      if (undoStack.length > 200) undoStack.shift();
      redoStack = [];
    }
    s.data[r][c] = val;
    markDirty();
  }

  function styleKey(r, c) {
    return `${r},${c}`;
  }

  function getStyle(r, c) {
    const s = currentSheet();
    if (!s.styles) s.styles = {};
    return s.styles[styleKey(r, c)] || {};
  }

  function setStyle(r, c, patch) {
    const s = currentSheet();
    if (!s.styles) s.styles = {};
    const k = styleKey(r, c);
    const prev = { ...(s.styles[k] || {}) };
    const next = { ...prev, ...patch };
    // prune nulls/undefined
    Object.keys(next).forEach((key) => {
      if (next[key] == null || next[key] === false || next[key] === '') delete next[key];
    });
    if (Object.keys(next).length === 0) delete s.styles[k];
    else s.styles[k] = next;
    undoStack.push({ type: 'style', r, c, prev, next: { ...(s.styles[k] || {}) }, sheet: activeSheet });
    if (undoStack.length > 200) undoStack.shift();
    redoStack = [];
    markDirty();
  }

  function forEachSelected(fn) {
    const a = normalizeRange();
    for (let r = a.r1; r <= a.r2; r++) {
      for (let c = a.c1; c <= a.c2; c++) fn(r, c);
    }
  }

  function colToIndex(letters) {
    let n = 0;
    const s = String(letters).toUpperCase();
    for (let i = 0; i < s.length; i++) n = n * 26 + (s.charCodeAt(i) - 64);
    return n - 1;
  }

  // ── Formula engine ─────────────────────────────────────
  function collectNums(args, depth) {
    const nums = [];
    for (const p of args) {
      if (p.type === 'range') {
        for (let r = p.r1; r <= p.r2; r++) {
          for (let c = p.c1; c <= p.c2; c++) {
            const n = toNum(evalCell(getCell(r, c), depth + 1));
            if (n != null) nums.push(n);
          }
        }
      } else if (p.type === 'cell') {
        const n = toNum(evalCell(getCell(p.r, p.c), depth + 1));
        if (n != null) nums.push(n);
      } else if (p.type === 'num') {
        nums.push(p.v);
      } else if (p.type === 'str') {
        const n = toNum(p.v);
        if (n != null) nums.push(n);
      }
    }
    return nums;
  }

  function collectValues(args, depth) {
    const vals = [];
    for (const p of args) {
      if (p.type === 'range') {
        for (let r = p.r1; r <= p.r2; r++) {
          for (let c = p.c1; c <= p.c2; c++) {
            vals.push(evalCell(getCell(r, c), depth + 1));
          }
        }
      } else if (p.type === 'cell') {
        vals.push(evalCell(getCell(p.r, p.c), depth + 1));
      } else if (p.type === 'num') {
        vals.push(String(p.v));
      } else if (p.type === 'str') {
        vals.push(p.v);
      }
    }
    return vals;
  }

  function toNum(v) {
    if (v === '' || v == null) return null;
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    const t = String(v).replace(/[$,\s]/g, '').replace(/%$/, '');
    if (t === '' || t === 'TRUE' || t === 'FALSE') {
      if (String(v).toUpperCase() === 'TRUE') return 1;
      if (String(v).toUpperCase() === 'FALSE') return 0;
      return null;
    }
    const n = Number(t);
    return Number.isFinite(n) ? n : null;
  }

  function parseArgs(argStr) {
    const args = [];
    let i = 0;
    const s = argStr;
    while (i < s.length) {
      while (i < s.length && /[\s,]/.test(s[i])) i++;
      if (i >= s.length) break;
      if (s[i] === '"') {
        let j = i + 1;
        let str = '';
        while (j < s.length && s[j] !== '"') {
          if (s[j] === '\\') j++;
          str += s[j++];
        }
        args.push({ type: 'str', v: str });
        i = j + 1;
        continue;
      }
      let j = i;
      let depth = 0;
      while (j < s.length) {
        if (s[j] === '(') depth++;
        if (s[j] === ')') depth--;
        if (s[j] === ',' && depth === 0) break;
        j++;
      }
      const token = s.slice(i, j).trim();
      i = j;
      if (!token) continue;
      const range = token.match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/i);
      if (range) {
        args.push({
          type: 'range',
          c1: colToIndex(range[1]),
          r1: parseInt(range[2], 10) - 1,
          c2: colToIndex(range[3]),
          r2: parseInt(range[4], 10) - 1,
        });
        continue;
      }
      const one = token.match(/^([A-Z]+)(\d+)$/i);
      if (one) {
        args.push({ type: 'cell', c: colToIndex(one[1]), r: parseInt(one[2], 10) - 1 });
        continue;
      }
      const n = Number(token);
      if (Number.isFinite(n) && /^-?[\d.]+([eE][+-]?\d+)?$/.test(token)) {
        args.push({ type: 'num', v: n });
        continue;
      }
      // nested formula-ish token — evaluate as expression
      args.push({ type: 'str', v: evalExpr(token, 0) });
    }
    return args;
  }

  function evalExpr(expr, depth) {
    // Function call FOO(...)
    const fnMatch = expr.match(/^([A-Z_][A-Z0-9_]*)\((.*)\)$/is);
    if (fnMatch) {
      return evalFunction(fnMatch[1].toUpperCase(), parseArgs(fnMatch[2]), depth);
    }
    // Replace cell refs then safe math
    try {
      let replaced = expr.replace(/([A-Z]+)(\d+)/gi, (_, col, row) => {
        const v = evalCell(getCell(parseInt(row, 10) - 1, colToIndex(col)), depth + 1);
        const n = toNum(v);
        return n == null ? '0' : String(n);
      });
      replaced = replaced.replace(/\bTRUE\b/gi, '1').replace(/\bFALSE\b/gi, '0');
      if (!/^[\d.\s+\-*/()%,^<>!=&|]+$/.test(replaced)) return '#ERR!';
      // power ^
      replaced = replaced.replace(/(\d+(?:\.\d+)?)\s*\^\s*(\d+(?:\.\d+)?)/g, 'Math.pow($1,$2)');
      // eslint-disable-next-line no-new-func
      const result = Function(`"use strict"; return (${replaced});`)();
      if (typeof result === 'boolean') return result ? 'TRUE' : 'FALSE';
      if (typeof result === 'number' && Number.isFinite(result)) {
        return formatRawNumber(result);
      }
      return String(result);
    } catch {
      return '#ERR!';
    }
  }

  function formatRawNumber(n) {
    if (Number.isInteger(n)) return String(n);
    return String(Math.round(n * 1e12) / 1e12);
  }

  function evalFunction(name, args, depth) {
    const nums = () => collectNums(args, depth);
    const vals = () => collectValues(args, depth);
    switch (name) {
      case 'SUM':
      case 'SUMIF': // simplified: SUM
        return formatRawNumber(nums().reduce((a, b) => a + b, 0));
      case 'AVERAGE':
      case 'AVG': {
        const n = nums();
        return n.length ? formatRawNumber(n.reduce((a, b) => a + b, 0) / n.length) : '#DIV/0!';
      }
      case 'COUNT':
        return String(nums().length);
      case 'COUNTA':
        return String(vals().filter((v) => v !== '' && v != null).length);
      case 'MIN': {
        const n = nums();
        return n.length ? formatRawNumber(Math.min(...n)) : '0';
      }
      case 'MAX': {
        const n = nums();
        return n.length ? formatRawNumber(Math.max(...n)) : '0';
      }
      case 'PRODUCT':
        return formatRawNumber(nums().reduce((a, b) => a * b, 1));
      case 'MEDIAN': {
        const n = nums().sort((a, b) => a - b);
        if (!n.length) return '0';
        const m = Math.floor(n.length / 2);
        return formatRawNumber(n.length % 2 ? n[m] : (n[m - 1] + n[m]) / 2);
      }
      case 'STDEV':
      case 'STDEV.S': {
        const n = nums();
        if (n.length < 2) return '#DIV/0!';
        const mean = n.reduce((a, b) => a + b, 0) / n.length;
        const v = n.reduce((a, b) => a + (b - mean) ** 2, 0) / (n.length - 1);
        return formatRawNumber(Math.sqrt(v));
      }
      case 'ABS':
        return formatRawNumber(Math.abs(nums()[0] || 0));
      case 'SQRT': {
        const x = nums()[0];
        return x == null || x < 0 ? '#NUM!' : formatRawNumber(Math.sqrt(x));
      }
      case 'POWER':
      case 'POW': {
        const n = nums();
        return formatRawNumber(Math.pow(n[0] || 0, n[1] || 0));
      }
      case 'ROUND': {
        const n = nums();
        const d = n[1] != null ? n[1] : 0;
        const f = Math.pow(10, d);
        return formatRawNumber(Math.round((n[0] || 0) * f) / f);
      }
      case 'ROUNDUP': {
        const n = nums();
        const d = n[1] != null ? n[1] : 0;
        const f = Math.pow(10, d);
        return formatRawNumber(Math.ceil((n[0] || 0) * f) / f);
      }
      case 'ROUNDDOWN':
      case 'TRUNC': {
        const n = nums();
        const d = n[1] != null ? n[1] : 0;
        const f = Math.pow(10, d);
        return formatRawNumber(Math.trunc((n[0] || 0) * f) / f);
      }
      case 'INT':
        return formatRawNumber(Math.floor(nums()[0] || 0));
      case 'MOD': {
        const n = nums();
        return formatRawNumber((n[0] || 0) % (n[1] || 1));
      }
      case 'IF': {
        const cond = args[0];
        let ok = false;
        if (cond.type === 'num') ok = cond.v !== 0;
        else if (cond.type === 'str') ok = cond.v !== '' && cond.v !== '0' && cond.v.toUpperCase() !== 'FALSE';
        else if (cond.type === 'cell') {
          const v = evalCell(getCell(cond.r, cond.c), depth + 1);
          ok = v !== '' && v !== '0' && String(v).toUpperCase() !== 'FALSE';
        } else {
          // range / expression as first arg string
          const v = vals()[0];
          ok = v !== '' && v !== '0' && String(v).toUpperCase() !== 'FALSE';
        }
        // re-eval true/false branches if cells
        const pick = (arg) => {
          if (!arg) return '';
          if (arg.type === 'cell') return evalCell(getCell(arg.r, arg.c), depth + 1);
          if (arg.type === 'num') return formatRawNumber(arg.v);
          if (arg.type === 'str') return arg.v;
          if (arg.type === 'range') return evalCell(getCell(arg.r1, arg.c1), depth + 1);
          return '';
        };
        return ok ? pick(args[1]) : pick(args[2]);
      }
      case 'AND':
        return vals().every((v) => v !== '' && v !== '0' && String(v).toUpperCase() !== 'FALSE')
          ? 'TRUE'
          : 'FALSE';
      case 'OR':
        return vals().some((v) => v !== '' && v !== '0' && String(v).toUpperCase() !== 'FALSE')
          ? 'TRUE'
          : 'FALSE';
      case 'NOT': {
        const v = vals()[0];
        const ok = v !== '' && v !== '0' && String(v).toUpperCase() !== 'FALSE';
        return ok ? 'FALSE' : 'TRUE';
      }
      case 'LEN':
        return String(String(vals()[0] || '').length);
      case 'LEFT': {
        const v = vals();
        const n = nums();
        return String(v[0] || '').slice(0, n[1] != null ? n[1] : 1);
      }
      case 'RIGHT': {
        const v = vals();
        const n = toNum(vals()[1]) ?? nums()[0] ?? 1;
        const s = String(v[0] || '');
        return s.slice(-n);
      }
      case 'MID': {
        const s = String(vals()[0] || '');
        const start = (toNum(vals()[1]) || 1) - 1;
        const len = toNum(vals()[2]) || 0;
        return s.substr(start, len);
      }
      case 'CONCAT':
      case 'CONCATENATE':
        return vals().join('');
      case 'UPPER':
        return String(vals()[0] || '').toUpperCase();
      case 'LOWER':
        return String(vals()[0] || '').toLowerCase();
      case 'TRIM':
        return String(vals()[0] || '').trim().replace(/\s+/g, ' ');
      case 'PI':
        return formatRawNumber(Math.PI);
      case 'RAND':
        return formatRawNumber(Math.random());
      case 'RANDBETWEEN': {
        const n = nums();
        const lo = Math.ceil(n[0] || 0);
        const hi = Math.floor(n[1] || 0);
        return String(Math.floor(Math.random() * (hi - lo + 1)) + lo);
      }
      case 'TODAY': {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      }
      case 'NOW':
        return new Date().toISOString();
      case 'VALUE': {
        const n = toNum(vals()[0]);
        return n == null ? '#VALUE!' : formatRawNumber(n);
      }
      case 'N': {
        const n = toNum(vals()[0]);
        return formatRawNumber(n == null ? 0 : n);
      }
      default:
        return '#NAME?';
    }
  }

  function evalCell(raw, depth = 0) {
    if (raw == null || raw === '') return '';
    const s = String(raw);
    if (!s.startsWith('=')) return s;
    if (depth > 30) return '#CYCLE!';
    return evalExpr(s.slice(1).trim(), depth);
  }

  function formatDisplay(r, c) {
    const raw = getCell(r, c);
    const st = getStyle(r, c);
    if (st.link && st.link_text) return st.link_text;
    let val = evalCell(raw);
    const n = toNum(val);
    if (n != null && (st.currency || st.decimals != null)) {
      let dec = st.decimals != null ? st.decimals : st.currency ? 2 : undefined;
      if (dec != null && dec < 0) dec = 0;
      if (st.currency) {
        try {
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: st.currency || DEFAULT_CURRENCY,
            minimumFractionDigits: dec != null ? dec : 2,
            maximumFractionDigits: dec != null ? dec : 2,
          }).format(n);
        } catch {
          return `$${(+n).toFixed(dec != null ? dec : 2)}`;
        }
      }
      if (dec != null) return n.toFixed(dec);
    }
    return val;
  }

  function setStatus(text, kind = '') {
    statusText.textContent = text;
    statusText.classList.remove('saving', 'error');
    if (kind) statusText.classList.add(kind);
  }

  function markDirty() {
    dirty = true;
    setStatus('Unsaved changes', 'saving');
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveWorkbookLocal({ quiet: true }), 1600);
  }

  function setTitle(raw) {
    const title = (raw || '').trim() || 'Untitled spreadsheet';
    document.title = `${title} — XSheet`;
  }

  function setZoom(level, { quiet = false } = {}) {
    const n = Math.round(Number(level));
    if (!Number.isFinite(n)) return;
    zoom = Math.max(25, Math.min(400, n));
    applyZoom();
    if (!quiet) setStatus('Zoom ' + zoom + '%');
  }

  function applyZoom() {
    document.documentElement.style.setProperty('--col-w', colW() + 'px');
    document.documentElement.style.setProperty('--row-h', rowH() + 'px');
    document.documentElement.style.setProperty('--header-h', Math.max(18, Math.round(25 * (zoom / 100))) + 'px');
    document.documentElement.style.setProperty('--row-w', Math.max(36, Math.round(46 * (zoom / 100))) + 'px');
    if (zoomBtn) zoomBtn.textContent = zoom + '%';
    const custom = $('zoom-custom-input');
    if (custom) custom.value = String(zoom);
    // Highlight active preset
    if (zoomMenu) {
      zoomMenu.querySelectorAll('[data-zoom]').forEach((btn) => {
        btn.classList.toggle('active', +btn.getAttribute('data-zoom') === zoom);
      });
    }
    renderGrid();
  }

  function closeMenus() {
    [zoomMenu, fontMenu, saveMenu, chartMenu, textColorPicker, fillColorPicker].forEach((el) => {
      if (!el) return;
      el.classList.add('hidden');
      el.style.visibility = '';
    });
    [zoomBtn, fontBtn, saveMenuBtn, chartBtn, textColorBtn, fillColorBtn].forEach((el) => {
      if (el) el.setAttribute('aria-expanded', 'false');
    });
    openPopoverEl = null;
    openPopoverBtn = null;
  }

  function positionPopover(btn, menu) {
    // Ensure menu is on body so toolbar overflow cannot clip it
    if (menu.parentElement !== document.body) {
      document.body.appendChild(menu);
    }
    menu.classList.remove('hidden');
    // Measure after shown
    const br = btn.getBoundingClientRect();
    const mw = menu.offsetWidth || 200;
    const mh = menu.offsetHeight || 200;
    let left = br.left;
    let top = br.bottom + 6;
    if (left + mw > window.innerWidth - 8) left = Math.max(8, window.innerWidth - mw - 8);
    if (left < 8) left = 8;
    if (top + mh > window.innerHeight - 8) {
      // open above if needed
      top = Math.max(8, br.top - mh - 6);
    }
    menu.style.left = left + 'px';
    menu.style.top = top + 'px';
  }

  function toggleMenu(btn, menu) {
    if (!btn || !menu) return;
    const wasOpen = openPopoverEl === menu && !menu.classList.contains('hidden');
    closeMenus();
    if (!wasOpen) {
      positionPopover(btn, menu);
      btn.setAttribute('aria-expanded', 'true');
      openPopoverEl = menu;
      openPopoverBtn = btn;
    }
  }

  function buildColorPicker(title, onPick, { allowNone = false } = {}) {
    const el = document.createElement('div');
    el.className = 'picker liquid-glass liquid-glass--heavy hidden';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', title);

    const head = document.createElement('div');
    head.className = 'picker-title';
    head.textContent = title;
    el.appendChild(head);

    if (allowNone) {
      const none = document.createElement('button');
      none.type = 'button';
      none.className = 'picker-none';
      none.textContent = 'No fill';
      none.addEventListener('click', (e) => {
        e.stopPropagation();
        onPick(null);
        closeMenus();
      });
      el.appendChild(none);
    }

    const grid = document.createElement('div');
    grid.className = 'picker-swatches';
    PALETTE.forEach((color) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'swatch';
      b.style.background = color;
      b.title = color;
      b.setAttribute('aria-label', color);
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        onPick(color);
        closeMenus();
      });
      grid.appendChild(b);
    });
    el.appendChild(grid);

    const custom = document.createElement('div');
    custom.className = 'picker-custom';
    const lab = document.createElement('label');
    lab.textContent = 'Custom';
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = '#1d1d1f';
    colorInput.title = 'Pick any color';
    const hexInput = document.createElement('input');
    hexInput.type = 'text';
    hexInput.placeholder = '#1d1d1f';
    hexInput.maxLength = 9;
    hexInput.spellcheck = false;
    const applyBtn = document.createElement('button');
    applyBtn.type = 'button';
    applyBtn.className = 'picker-apply';
    applyBtn.textContent = 'Apply';

    function normalizeHex(v) {
      let s = String(v || '').trim();
      if (!s) return null;
      if (s[0] !== '#') s = '#' + s;
      if (/^#[0-9a-fA-F]{3}$/.test(s)) {
        s =
          '#' +
          s
            .slice(1)
            .split('')
            .map((c) => c + c)
            .join('');
      }
      if (!/^#[0-9a-fA-F]{6}$/.test(s)) return null;
      return s.toLowerCase();
    }

    colorInput.addEventListener('input', () => {
      hexInput.value = colorInput.value;
    });
    colorInput.addEventListener('change', (e) => {
      e.stopPropagation();
      onPick(colorInput.value);
      closeMenus();
    });
    applyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const hex = normalizeHex(hexInput.value) || colorInput.value;
      if (hex) {
        onPick(hex);
        closeMenus();
      }
    });
    hexInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        applyBtn.click();
      }
    });
    hexInput.addEventListener('click', (e) => e.stopPropagation());
    colorInput.addEventListener('click', (e) => e.stopPropagation());

    custom.appendChild(lab);
    custom.appendChild(colorInput);
    custom.appendChild(hexInput);
    custom.appendChild(applyBtn);
    el.appendChild(custom);

    el.addEventListener('click', (e) => e.stopPropagation());
    document.body.appendChild(el);
    return el;
  }

  function populateFontMenu() {
    if (!fontMenu) return;
    fontMenu.innerHTML = '';
    FONT_LIST.forEach((f) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'menu-option font-option';
      b.setAttribute('data-font', f.name);
      b.style.fontFamily = f.stack;
      b.textContent = f.name;
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        setFont(f.name);
        closeMenus();
      });
      fontMenu.appendChild(b);
    });
    fontMenu.addEventListener('click', (e) => e.stopPropagation());
  }

  function renderHeaders() {
    const s = currentSheet();
    const cols = Math.max(s.data[0]?.length || DEFAULT_COLS, DEFAULT_COLS);
    const rows = Math.max(s.data.length, DEFAULT_ROWS);
    const a = normalizeRange();

    colHeaders.innerHTML = '';
    colHeaders.style.width = cols * colW() + 'px';
    for (let c = 0; c < cols; c++) {
      const d = document.createElement('div');
      d.className = 'col-h';
      if (c >= a.c1 && c <= a.c2) d.classList.add('sel-range');
      if (c === focus.c) d.classList.add('active');
      d.textContent = colLetters(c);
      d.dataset.c = String(c);
      d.style.width = colW() + 'px';
      d.style.minWidth = colW() + 'px';
      colHeaders.appendChild(d);
    }

    rowHeaders.innerHTML = '';
    for (let r = 0; r < rows; r++) {
      const d = document.createElement('div');
      d.className = 'row-h';
      if (r >= a.r1 && r <= a.r2) d.classList.add('sel-range');
      if (r === focus.r) d.classList.add('active');
      d.textContent = String(r + 1);
      d.dataset.r = String(r);
      d.style.height = rowH() + 'px';
      d.style.minHeight = rowH() + 'px';
      rowHeaders.appendChild(d);
    }
  }

  function renderGrid() {
    const s = currentSheet();
    ensureSize(s, DEFAULT_ROWS, DEFAULT_COLS);
    const rows = s.data.length;
    const cols = s.data[0].length;
    const a = normalizeRange();
    const cw = colW();
    const rh = rowH();

    gridCanvas.innerHTML = '';
    gridCanvas.style.width = cols * cw + 'px';

    const frag = document.createDocumentFragment();
    for (let r = 0; r < rows; r++) {
      const rowEl = document.createElement('div');
      rowEl.className = 'grid-row';
      rowEl.style.height = rh + 'px';
      for (let c = 0; c < cols; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.r = String(r);
        cell.dataset.c = String(c);
        cell.style.width = cw + 'px';
        cell.style.minWidth = cw + 'px';
        cell.style.height = rh + 'px';
        cell.style.lineHeight = rh + 'px';

        const st = getStyle(r, c);
        const disp = formatDisplay(r, c);
        const raw = getCell(r, c);

        if (st.link) {
          const aEl = document.createElement('a');
          aEl.className = 'cell-link';
          aEl.href = st.link;
          aEl.target = '_blank';
          aEl.rel = 'noopener noreferrer';
          aEl.textContent = st.link_text || disp || st.link;
          aEl.addEventListener('click', (e) => e.stopPropagation());
          cell.appendChild(aEl);
        } else {
          cell.textContent = disp;
        }

        if (raw.startsWith('=')) cell.title = raw;
        if (toNum(evalCell(raw)) != null && !st.align) cell.classList.add('num');

        const font = st.font || defaultFont;
        const size = st.size != null ? st.size : defaultSize;
        cell.style.fontFamily = FONT_STACK[font] || font + ', sans-serif';
        cell.style.fontSize = Math.max(8, Math.round(size * (zoom / 100))) + 'px';
        if (st.bold) cell.style.fontWeight = '700';
        if (st.italic) cell.style.fontStyle = 'italic';
        if (st.color) cell.style.color = st.color;
        if (st.fill) cell.style.background = st.fill;
        if (st.align) {
          cell.style.textAlign = st.align;
          cell.classList.add('align-' + st.align);
        }

        if (r >= a.r1 && r <= a.r2 && c >= a.c1 && c <= a.c2) {
          if (!(r === focus.r && c === focus.c)) cell.classList.add('in-range');
        }
        if (r === focus.r && c === focus.c) cell.classList.add('active');

        rowEl.appendChild(cell);
      }
      frag.appendChild(rowEl);
    }
    gridCanvas.appendChild(frag);
    renderHeaders();
    renderSheetTabs();
    renderCharts();
    nameBox.textContent = rangeLabel();
    if (!editing) formulaInput.value = getCell(focus.r, focus.c);
    syncToolbarFromFocus();
    syncHeaderScroll();
  }

  function syncToolbarFromFocus() {
    const st = getStyle(focus.r, focus.c);
    fontLabel.textContent = st.font || defaultFont;
    fsVal.value = String(st.size != null ? st.size : defaultSize);
    textColBar.style.background = st.color || '#1d1d1f';
    fillColBar.style.background = st.fill || 'transparent';
    fillColBar.style.border = st.fill ? 'none' : '1px solid var(--border)';
    $('bold-btn').setAttribute('aria-pressed', st.bold ? 'true' : 'false');
    $('italic-btn').setAttribute('aria-pressed', st.italic ? 'true' : 'false');
    $('currency-btn').setAttribute('aria-pressed', st.currency ? 'true' : 'false');
  }

  function renderSheetTabs() {
    sheetTabs.innerHTML = '';
    sheets.forEach((s, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'sheet-tab' + (i === activeSheet ? ' active' : '');
      btn.setAttribute('role', 'tab');
      btn.textContent = s.name;
      btn.addEventListener('click', () => {
        if (activeSheet === i) return;
        commitEditor();
        activeSheet = i;
        anchor = focus = { r: 0, c: 0 };
        renderGrid();
        markDirty();
      });
      sheetTabs.appendChild(btn);
    });
  }

  function syncHeaderScroll() {
    colHeaders.scrollLeft = gridViewport.scrollLeft;
    rowHeaders.scrollTop = gridViewport.scrollTop;
  }

  function selectCell(r, c, { extend = false, edit = false, soft = false } = {}) {
    commitEditor();
    const s = currentSheet();
    ensureSize(s, r + 1, c + 1);
    r = Math.max(0, Math.min(r, s.data.length - 1));
    c = Math.max(0, Math.min(c, s.data[0].length - 1));
    if (!extend) anchor = { r, c };
    focus = { r, c };
    if (soft) {
      updateSelectionVisual();
      syncToolbarFromFocus();
      if (!editing) formulaInput.value = getCell(focus.r, focus.c);
    } else {
      renderGrid();
    }
    if (edit) startEdit();
  }

  function selectRange(r1, c1, r2, c2, { soft = false } = {}) {
    commitEditor();
    const s = currentSheet();
    ensureSize(s, Math.max(r1, r2) + 1, Math.max(c1, c2) + 1);
    anchor = { r: r1, c: c1 };
    focus = { r: r2, c: c2 };
    if (soft) {
      updateSelectionVisual();
      syncToolbarFromFocus();
      if (!editing) formulaInput.value = getCell(focus.r, focus.c);
    } else {
      renderGrid();
    }
  }

  /** Update active/range classes without rebuilding the grid (avoids hover thrash). */
  function updateSelectionVisual() {
    const a = normalizeRange();
    nameBox.textContent = rangeLabel();
    gridCanvas.querySelectorAll('.cell').forEach((cell) => {
      const r = +cell.dataset.r;
      const c = +cell.dataset.c;
      const isActive = r === focus.r && c === focus.c;
      const inRange = r >= a.r1 && r <= a.r2 && c >= a.c1 && c <= a.c2;
      cell.classList.toggle('active', isActive);
      cell.classList.toggle('in-range', inRange && !isActive);
    });
    colHeaders.querySelectorAll('.col-h').forEach((el) => {
      const c = +el.dataset.c;
      el.classList.toggle('active', c === focus.c);
      el.classList.toggle('sel-range', c >= a.c1 && c <= a.c2);
    });
    rowHeaders.querySelectorAll('.row-h').forEach((el) => {
      const r = +el.dataset.r;
      el.classList.toggle('active', r === focus.r);
      el.classList.toggle('sel-range', r >= a.r1 && r <= a.r2);
    });
  }

  function endDragSelect(pointerId) {
    if (!dragSelect) return;
    dragSelect = false;
    if (pointerId != null && dragPointerId === pointerId) {
      try {
        if (gridCanvas.hasPointerCapture?.(pointerId)) {
          gridCanvas.releasePointerCapture(pointerId);
        }
      } catch {
        /* ignore */
      }
    }
    dragPointerId = null;
    // One full paint after drag ends (formula bar, styles, etc.)
    renderGrid();
  }

  function cellFromPoint(clientX, clientY) {
    const el = document.elementFromPoint(clientX, clientY);
    if (!el) return null;
    const cell = el.closest?.('.cell');
    if (!cell || !gridCanvas.contains(cell)) return null;
    return cell;
  }

  function startEdit(initial) {
    const cell = gridCanvas.querySelector(`.cell[data-r="${focus.r}"][data-c="${focus.c}"]`);
    if (!cell) return;
    editing = true;
    const rect = cell.getBoundingClientRect();
    const parent = gridViewport.getBoundingClientRect();
    cellEditor.classList.remove('hidden');
    cellEditor.style.left = rect.left - parent.left + gridViewport.scrollLeft + 'px';
    cellEditor.style.top = rect.top - parent.top + gridViewport.scrollTop + 'px';
    cellEditor.style.width = Math.max(colW(), rect.width) + 'px';
    cellEditor.style.height = rowH() + 'px';
    cellEditor.value = initial != null ? initial : getCell(focus.r, focus.c);
    cellEditor.focus();
    if (initial != null) {
      cellEditor.selectionStart = cellEditor.value.length;
      cellEditor.selectionEnd = cellEditor.value.length;
    } else cellEditor.select();
  }

  function commitEditor() {
    if (!editing) return;
    editing = false;
    const val = cellEditor.value;
    cellEditor.classList.add('hidden');
    setCell(focus.r, focus.c, val);
    formulaInput.value = val;
    renderGrid();
  }

  function cancelEditor() {
    if (!editing) return;
    editing = false;
    cellEditor.classList.add('hidden');
    formulaInput.value = getCell(focus.r, focus.c);
  }

  // ── Charts ─────────────────────────────────────────────
  function selectionChartData() {
    const a = normalizeRange();
    const labels = [];
    const values = [];
    // Prefer label | value pairs (2 cols) or single col of values
    if (a.c2 > a.c1) {
      for (let r = a.r1; r <= a.r2; r++) {
        const lab = formatDisplay(r, a.c1) || cellRef(r, a.c1);
        const n = toNum(evalCell(getCell(r, a.c1 + 1)));
        if (n != null) {
          labels.push(String(lab));
          values.push(n);
        }
      }
    } else {
      for (let r = a.r1; r <= a.r2; r++) {
        for (let c = a.c1; c <= a.c2; c++) {
          const n = toNum(evalCell(getCell(r, c)));
          if (n != null) {
            labels.push(cellRef(r, c));
            values.push(n);
          }
        }
      }
    }
    return { labels, values };
  }

  function insertChart(type) {
    const data = selectionChartData();
    if (!data.values.length) {
      setStatus('Select numeric cells for a chart', 'error');
      return;
    }
    const s = currentSheet();
    if (!s.charts) s.charts = [];
    const chart = {
      id: 'ch' + chartIdSeq++,
      type,
      labels: data.labels,
      values: data.values,
      x: 80 + s.charts.length * 24,
      y: 40 + s.charts.length * 24,
      w: 280,
      h: 200,
      title: type.toUpperCase() + ' chart',
    };
    s.charts.push(chart);
    markDirty();
    renderCharts();
    setStatus('Chart inserted');
  }

  function renderCharts() {
    chartLayer.innerHTML = '';
    const s = currentSheet();
    (s.charts || []).forEach((ch) => {
      const el = document.createElement('div');
      el.className = 'chart-float';
      el.style.left = ch.x + 'px';
      el.style.top = ch.y + 'px';
      el.style.width = ch.w + 'px';
      el.style.height = ch.h + 'px';
      el.innerHTML = `<div class="chart-title"><span></span><button type="button" class="chart-close" title="Remove">×</button></div><canvas></canvas>`;
      el.querySelector('.chart-title span').textContent = ch.title;
      el.querySelector('.chart-close').addEventListener('click', (e) => {
        e.stopPropagation();
        s.charts = s.charts.filter((c) => c.id !== ch.id);
        markDirty();
        renderCharts();
      });
      el.addEventListener('mousedown', (e) => {
        if (e.target.closest('.chart-close')) return;
        draggingChart = {
          id: ch.id,
          ox: e.clientX - ch.x,
          oy: e.clientY - ch.y,
        };
        e.preventDefault();
      });
      const canvas = el.querySelector('canvas');
      chartLayer.appendChild(el);
      drawChart(canvas, ch);
    });
  }

  function drawChart(canvas, ch) {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth || ch.w - 20;
    const h = canvas.clientHeight || ch.h - 40;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);
    const vals = ch.values || [];
    const labels = ch.labels || [];
    if (!vals.length) return;
    const max = Math.max(...vals.map(Math.abs), 1);
    const colors = ['#1d1d1f', '#666', '#999', '#4a86e8', '#6aa84f', '#e69138', '#cc0000', '#674ea7', '#45818e', '#f1c232'];

    if (ch.type === 'pie') {
      const total = vals.reduce((a, b) => a + Math.abs(b), 0) || 1;
      let ang = -Math.PI / 2;
      const cx = w / 2;
      const cy = h / 2;
      const r = Math.min(w, h) * 0.38;
      vals.forEach((v, i) => {
        const slice = (Math.abs(v) / total) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, ang, ang + slice);
        ctx.closePath();
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
        ang += slice;
      });
      return;
    }

    const pad = { l: 36, r: 10, t: 10, b: 28 };
    const plotW = w - pad.l - pad.r;
    const plotH = h - pad.t - pad.b;

    if (ch.type === 'line') {
      ctx.strokeStyle = '#1d1d1f';
      ctx.lineWidth = 2;
      ctx.beginPath();
      vals.forEach((v, i) => {
        const x = pad.l + (i / Math.max(vals.length - 1, 1)) * plotW;
        const y = pad.t + plotH - (v / max) * plotH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      vals.forEach((v, i) => {
        const x = pad.l + (i / Math.max(vals.length - 1, 1)) * plotW;
        const y = pad.t + plotH - (v / max) * plotH;
        ctx.fillStyle = '#1d1d1f';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (ch.type === 'hbar') {
      const bh = plotH / vals.length - 4;
      vals.forEach((v, i) => {
        const y = pad.t + i * (plotH / vals.length) + 2;
        const bw = (Math.abs(v) / max) * plotW;
        ctx.fillStyle = colors[i % colors.length];
        ctx.fillRect(pad.l, y, bw, Math.max(bh, 4));
        ctx.fillStyle = '#888';
        ctx.font = '10px Inter,sans-serif';
        ctx.fillText(String(labels[i] || '').slice(0, 8), 2, y + bh / 2 + 3);
      });
    } else {
      // vbar
      const bw = plotW / vals.length - 4;
      vals.forEach((v, i) => {
        const x = pad.l + i * (plotW / vals.length) + 2;
        const bh = (Math.abs(v) / max) * plotH;
        ctx.fillStyle = colors[i % colors.length];
        ctx.fillRect(x, pad.t + plotH - bh, Math.max(bw, 4), bh);
      });
    }
  }

  document.addEventListener('mousemove', (e) => {
    if (!draggingChart) return;
    const s = currentSheet();
    const ch = (s.charts || []).find((c) => c.id === draggingChart.id);
    if (!ch) return;
    ch.x = Math.max(0, e.clientX - draggingChart.ox);
    ch.y = Math.max(0, e.clientY - draggingChart.oy);
    const el = [...chartLayer.children].find((_, i) => (s.charts || [])[i]?.id === ch.id);
    // re-render positions only
    renderCharts();
  });
  document.addEventListener('mouseup', () => {
    if (draggingChart) {
      draggingChart = null;
      markDirty();
    }
  });

  // ── Files / save ───────────────────────────────────────
  function formatSize(n) {
    if (n < 1024) return n + ' B';
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
    return (n / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function iconForExt(ext) {
    switch ((ext || '').toLowerCase()) {
      case 'xlsx':
      case 'xlsm':
      case 'xls':
        return 'table';
      case 'csv':
      case 'tsv':
        return 'csv';
      case 'parquet':
        return 'database';
      default:
        return 'draft';
    }
  }

  async function loadFileList() {
    try {
      const [filesRes, docsRes, dirRes] = await Promise.all([
        fetch(`${API}/files`),
        fetch(`${API}/documents`),
        fetch(`${API}/files/docs-dir`),
      ]);
      const files = filesRes.ok ? await filesRes.json() : [];
      const docs = docsRes.ok ? await docsRes.json() : [];
      if (dirRes.ok) {
        const info = await dirRes.json();
        if (info.path) {
          const short = info.path.replace(/\\/g, '/').split('/').slice(-2).join('/');
          docsFolderLabel.textContent = short || 'Documents';
          docsFolderLabel.title = info.path;
        }
      }
      renderDocList(files, docs);
    } catch {
      docList.innerHTML = `<div class="doc-empty">Could not load files.</div>`;
    }
  }

  function renderDocList(files, docs) {
    docList.innerHTML = '';
    if ((!files || !files.length) && (!docs || !docs.length)) {
      docList.innerHTML =
        '<div class="doc-empty">No xlsx, csv, or parquet files found. Use <strong>Open Document</strong>.</div>';
      return;
    }
    if (docs?.length) {
      const h = document.createElement('div');
      h.className = 'doc-section';
      h.textContent = 'Recent workbooks';
      docList.appendChild(h);
      docs.forEach((d) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'doc-item' + (d.id === docId ? ' active' : '');
        btn.innerHTML = `<span class="material-symbols-outlined file-icon">grid_on</span><span class="file-meta"><span class="file-name"></span><span class="file-sub">Saved workbook</span></span>`;
        btn.querySelector('.file-name').textContent = d.title || 'Untitled';
        btn.addEventListener('click', () => openSavedDocument(d.id));
        docList.appendChild(btn);
      });
    }
    if (files?.length) {
      const h = document.createElement('div');
      h.className = 'doc-section';
      h.textContent = 'Documents folder';
      docList.appendChild(h);
      files.forEach((f) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'doc-item' + (f.path === activeFilePath ? ' active' : '');
        btn.innerHTML = `<span class="material-symbols-outlined file-icon">${iconForExt(f.ext)}</span><span class="file-meta"><span class="file-name"></span><span class="file-sub"></span></span>`;
        btn.querySelector('.file-name').textContent = f.name;
        btn.querySelector('.file-sub').textContent = `${(f.ext || '').toUpperCase()} · ${formatSize(f.size || 0)}`;
        btn.addEventListener('click', () => openPath(f.path));
        docList.appendChild(btn);
      });
    }
  }

  function payloadSheets() {
    return sheets.map((s) => ({
      name: s.name,
      data: s.data,
      styles: s.styles || {},
      charts: s.charts || [],
    }));
  }

  async function saveWorkbookLocal({ quiet = false, create = false } = {}) {
    const title = (docTitle.textContent || '').trim() || 'Untitled spreadsheet';
    const body = {
      title,
      sheets: payloadSheets(),
      active_sheet: activeSheet,
      starred,
      source_path: activeFilePath,
      source_format: activeFilePath ? (activeFilePath.split('.').pop() || '').toLowerCase() : null,
    };
    try {
      let res;
      if (!docId || create) {
        res = await fetch(`${API}/documents`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch(`${API}/documents/${docId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Save failed');
      const doc = await res.json();
      docId = doc.id;
      dirty = false;
      if (!quiet) setStatus('Saved locally');
      else setStatus('Saved locally');
      return doc;
    } catch (e) {
      setStatus(String(e.message || e), 'error');
      return null;
    }
  }

  async function exportFormat(format) {
    commitEditor();
    const title = (docTitle.textContent || '').trim() || 'spreadsheet';
    try {
      const res = await fetch(`${API}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format,
          title,
          sheets: payloadSheets(),
          active_sheet: activeSheet,
        }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Export failed');
      const blob = await res.blob();
      const cd = res.headers.get('Content-Disposition') || '';
      const star = cd.match(/filename\*=UTF-8''([^;]+)/i);
      const m = cd.match(/filename="([^"]+)"/);
      const name = star ? decodeURIComponent(star[1]) : m ? m[1] : `${title}.${format}`;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 60000);
      const saved = await saveWorkbookLocal({ quiet: true });
      if (saved) setStatus('Exported ' + name);
    } catch (e) {
      setStatus(String(e.message || e), 'error');
    }
  }

  async function saveAs(format = 'xlsx') {
    await exportFormat(format);
  }

  function applyOpened(opened) {
    sheets = (opened.sheets || []).map((s) => ({
      name: s.name || 'Sheet1',
      data: normalizeGrid(s.data),
      styles: s.styles || {},
      charts: s.charts || [],
    }));
    if (!sheets.length) sheets = [emptySheet('Sheet1')];
    activeSheet = Math.min(opened.active_sheet || 0, sheets.length - 1);
    anchor = focus = { r: 0, c: 0 };
    undoStack = [];
    redoStack = [];
    dirty = false;
    const title = opened.title || 'Untitled spreadsheet';
    docTitle.textContent = title;
    setTitle(title);
    renderGrid();
  }

  function normalizeGrid(data) {
    if (!Array.isArray(data) || !data.length) {
      return Array.from({ length: DEFAULT_ROWS }, () =>
        Array.from({ length: DEFAULT_COLS }, () => '')
      );
    }
    const cols = Math.max(DEFAULT_COLS, ...data.map((r) => (Array.isArray(r) ? r.length : 0)));
    const rows = Math.max(DEFAULT_ROWS, data.length);
    const out = [];
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) {
        row.push(data[r] && data[r][c] != null ? String(data[r][c]) : '');
      }
      out.push(row);
    }
    return out;
  }

  async function openPath(path) {
    commitEditor();
    clearTimeout(saveTimer);
    if (dirty && !(await saveWorkbookLocal({ quiet: true }))) return;
    setStatus('Opening…', 'saving');
    try {
      const res = await fetch(`${API}/files/open`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || res.statusText);
      const opened = await res.json();
      applyOpened(opened);
      activeFilePath = path;
      docId = null;
      await saveWorkbookLocal({ quiet: true, create: true });
      setStatus('Opened ' + opened.name);
      loadFileList();
    } catch (e) {
      setStatus(String(e.message || e), 'error');
    }
  }

  async function openSavedDocument(id) {
    commitEditor();
    clearTimeout(saveTimer);
    if (dirty && !(await saveWorkbookLocal({ quiet: true }))) return;
    setStatus('Loading…', 'saving');
    try {
      const res = await fetch(`${API}/documents/${id}`);
      if (!res.ok) throw new Error('Document not found');
      const doc = await res.json();
      docId = doc.id;
      activeFilePath = doc.source_path || null;
      starred = !!doc.starred;
      starBtn.setAttribute('aria-pressed', starred ? 'true' : 'false');
      sheets = (doc.sheets || []).map((s) => ({
        name: s.name || 'Sheet1',
        data: normalizeGrid(s.data),
        styles: s.styles || {},
        charts: s.charts || [],
      }));
      if (!sheets.length) sheets = [emptySheet('Sheet1')];
      activeSheet = Math.min(doc.active_sheet || 0, sheets.length - 1);
      anchor = focus = { r: 0, c: 0 };
      undoStack = [];
      redoStack = [];
      dirty = false;
      docTitle.textContent = doc.title || 'Untitled spreadsheet';
      setTitle(docTitle.textContent);
      renderGrid();
      setStatus('Saved locally');
      loadFileList();
    } catch (e) {
      setStatus(String(e.message || e), 'error');
    }
  }

  async function newDocument() {
    commitEditor();
    clearTimeout(saveTimer);
    if (dirty && !(await saveWorkbookLocal({ quiet: true }))) return;
    docId = null;
    activeFilePath = null;
    sheets = [emptySheet('Sheet1')];
    activeSheet = 0;
    anchor = focus = { r: 0, c: 0 };
    undoStack = [];
    redoStack = [];
    starred = false;
    starBtn.setAttribute('aria-pressed', 'false');
    docTitle.textContent = 'Untitled spreadsheet';
    setTitle('Untitled spreadsheet');
    dirty = false;
    renderGrid();
    await saveWorkbookLocal({ quiet: true, create: true });
    setStatus('New spreadsheet');
    loadFileList();
  }

  async function importFiles(fileList) {
    commitEditor();
    clearTimeout(saveTimer);
    if (dirty && !(await saveWorkbookLocal({ quiet: true }))) return;
    for (const file of fileList) {
      const fd = new FormData();
      fd.append('file', file, file.name);
      setStatus('Importing ' + file.name + '…', 'saving');
      try {
        const res = await fetch(`${API}/files/import`, { method: 'POST', body: fd });
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || res.statusText);
        const opened = await res.json();
        applyOpened(opened);
        activeFilePath = null;
        docId = null;
        await saveWorkbookLocal({ quiet: true, create: true });
        setStatus('Imported ' + opened.name);
        loadFileList();
      } catch (e) {
        setStatus(String(e.message || e), 'error');
      }
    }
  }

  // ── Undo ───────────────────────────────────────────────
  function undo() {
    const op = undoStack.pop();
    if (!op) return;
    activeSheet = op.sheet;
    const s = currentSheet();
    if (op.type === 'cell') {
      ensureSize(s, op.r + 1, op.c + 1);
      redoStack.push(op);
      s.data[op.r][op.c] = op.prev;
      focus = anchor = { r: op.r, c: op.c };
    } else if (op.type === 'style') {
      if (!s.styles) s.styles = {};
      const k = styleKey(op.r, op.c);
      redoStack.push(op);
      if (Object.keys(op.prev || {}).length) s.styles[k] = op.prev;
      else delete s.styles[k];
      focus = anchor = { r: op.r, c: op.c };
    }
    markDirty();
    renderGrid();
  }

  function redo() {
    const op = redoStack.pop();
    if (!op) return;
    activeSheet = op.sheet;
    if (op.type === 'cell') {
      setCell(op.r, op.c, op.next, { pushUndo: false });
      undoStack.push(op);
      focus = anchor = { r: op.r, c: op.c };
    } else if (op.type === 'style') {
      const s = currentSheet();
      if (!s.styles) s.styles = {};
      const k = styleKey(op.r, op.c);
      if (Object.keys(op.next || {}).length) s.styles[k] = op.next;
      else delete s.styles[k];
      undoStack.push(op);
      focus = anchor = { r: op.r, c: op.c };
      markDirty();
    }
    renderGrid();
  }

  // ── Events ─────────────────────────────────────────────
  gridViewport.addEventListener('scroll', syncHeaderScroll, { passive: true });

  // Cell selection: single click = one cell; click+drag (button held) = range.
  // Hover alone never changes selection.
  let lastCellDown = { t: 0, r: -1, c: -1 };
  gridCanvas.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    if (e.target.closest('a.cell-link')) return;
    const cell = e.target.closest('.cell');
    if (!cell) return;
    e.preventDefault();

    const r = +cell.dataset.r;
    const c = +cell.dataset.c;

    // Detect double-click by timing: PointerEvent.detail is always 0 in Chromium, and
    // pointerup re-renders the grid, so no click/dblclick event ever reaches the cell.
    const isDouble = !e.shiftKey && e.timeStamp - lastCellDown.t < 500 && lastCellDown.r === r && lastCellDown.c === c;
    lastCellDown = isDouble ? { t: 0, r: -1, c: -1 } : { t: e.timeStamp, r, c };
    if (isDouble) {
      endDragSelect(dragPointerId);
      selectCell(r, c, { edit: true });
      return;
    }

    dragSelect = true;
    dragPointerId = e.pointerId;
    try {
      gridCanvas.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }

    if (e.shiftKey) {
      focus = { r, c };
      updateSelectionVisual();
      syncToolbarFromFocus();
      if (!editing) formulaInput.value = getCell(r, c);
    } else {
      selectCell(r, c, { soft: true });
    }
  });

  gridCanvas.addEventListener('pointermove', (e) => {
    if (!dragSelect) return;
    if ((e.buttons & 1) === 0) {
      endDragSelect(e.pointerId);
      return;
    }
    const cell = cellFromPoint(e.clientX, e.clientY);
    if (!cell) return;
    const r = +cell.dataset.r;
    const c = +cell.dataset.c;
    if (r === focus.r && c === focus.c) return;
    focus = { r, c };
    updateSelectionVisual();
    if (!editing) formulaInput.value = getCell(focus.r, focus.c);
  });

  gridCanvas.addEventListener('pointerup', (e) => {
    if (e.button === 0) endDragSelect(e.pointerId);
  });
  gridCanvas.addEventListener('pointercancel', (e) => endDragSelect(e.pointerId));
  gridCanvas.addEventListener('lostpointercapture', () => {
    if (dragSelect) endDragSelect(null);
  });
  window.addEventListener('blur', () => endDragSelect(dragPointerId));
  document.addEventListener('pointerup', (e) => {
    if (e.button === 0 && dragSelect) endDragSelect(e.pointerId);
  });

  // Row / column: entire row or column only on double-click
  colHeaders.addEventListener('dblclick', (e) => {
    const h = e.target.closest('.col-h');
    if (!h) return;
    e.preventDefault();
    const c = +h.dataset.c;
    const s = currentSheet();
    selectRange(0, c, s.data.length - 1, c);
  });
  rowHeaders.addEventListener('dblclick', (e) => {
    const h = e.target.closest('.row-h');
    if (!h) return;
    e.preventDefault();
    const r = +h.dataset.r;
    const s = currentSheet();
    selectRange(r, 0, r, s.data[0].length - 1);
  });
  // Single-click header: focus that row/col only (one cell)
  colHeaders.addEventListener('click', (e) => {
    if (e.detail > 1) return;
    const h = e.target.closest('.col-h');
    if (!h) return;
    selectCell(focus.r, +h.dataset.c);
  });
  rowHeaders.addEventListener('click', (e) => {
    if (e.detail > 1) return;
    const h = e.target.closest('.row-h');
    if (!h) return;
    selectCell(+h.dataset.r, focus.c);
  });

  if (gridCorner) {
    gridCorner.addEventListener('dblclick', () => {
      const s = currentSheet();
      selectRange(0, 0, s.data.length - 1, s.data[0].length - 1);
    });
    gridCorner.title = 'Double-click to select all';
  }

  cellEditor.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitEditor();
      selectCell(focus.r + 1, focus.c);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      commitEditor();
      selectCell(focus.r, focus.c + (e.shiftKey ? -1 : 1));
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEditor();
    }
  });
  cellEditor.addEventListener('blur', () => {
    if (editing) commitEditor();
  });

  formulaInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setCell(focus.r, focus.c, formulaInput.value);
      renderGrid();
      selectCell(focus.r + 1, focus.c);
    } else if (e.key === 'Escape') {
      formulaInput.value = getCell(focus.r, focus.c);
      formulaInput.blur();
    }
  });
  formulaInput.addEventListener('change', () => {
    setCell(focus.r, focus.c, formulaInput.value);
    renderGrid();
  });

  document.addEventListener('keydown', (e) => {
    if (editing || e.target === formulaInput || e.target === docTitle || e.target === cellEditor || e.target === fsVal || e.target === linkText || e.target === linkUrl) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveAs('xlsx');
      }
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      saveAs('xlsx');
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      undo();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) {
      e.preventDefault();
      redo();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      toggleStyleField('bold');
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
      e.preventDefault();
      toggleStyleField('italic');
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openLinkDialog();
      return;
    }

    const extend = e.shiftKey;
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectCell(focus.r - 1, focus.c, { extend });
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectCell(focus.r + 1, focus.c, { extend });
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      selectCell(focus.r, focus.c - 1, { extend });
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      selectCell(focus.r, focus.c + 1, { extend });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      selectCell(focus.r + (e.shiftKey ? -1 : 1), focus.c);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      selectCell(focus.r, focus.c + (e.shiftKey ? -1 : 1));
    } else if (e.key === 'F2') {
      e.preventDefault();
      startEdit();
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      forEachSelected((r, c) => setCell(r, c, '', { pushUndo: true }));
      renderGrid();
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      // The editor is seeded with the key; stop the browser inserting it a second time.
      e.preventDefault();
      startEdit(e.key);
    }
  });

  function toggleStyleField(field) {
    const st = getStyle(focus.r, focus.c);
    const val = !st[field];
    forEachSelected((r, c) => setStyle(r, c, { [field]: val || null }));
    renderGrid();
  }

  function setAlign(align) {
    forEachSelected((r, c) => setStyle(r, c, { align }));
    renderGrid();
  }

  function setFont(font) {
    defaultFont = font;
    fontLabel.textContent = font;
    forEachSelected((r, c) => setStyle(r, c, { font }));
    renderGrid();
  }

  function setFontSize(size) {
    size = Math.max(6, Math.min(96, size));
    defaultSize = size;
    fsVal.value = String(size);
    forEachSelected((r, c) => setStyle(r, c, { size }));
    renderGrid();
  }

  function bumpDecimals(delta) {
    forEachSelected((r, c) => {
      const st = getStyle(r, c);
      let d = st.decimals != null ? st.decimals : st.currency ? 2 : 0;
      d = Math.max(0, Math.min(10, d + delta));
      setStyle(r, c, { decimals: d });
    });
    renderGrid();
  }

  function toggleCurrency() {
    const st = getStyle(focus.r, focus.c);
    const on = !st.currency;
    forEachSelected((r, c) => {
      if (on) setStyle(r, c, { currency: DEFAULT_CURRENCY, decimals: st.decimals != null ? st.decimals : 2 });
      else setStyle(r, c, { currency: null });
    });
    renderGrid();
  }

  function openLinkDialog() {
    const st = getStyle(focus.r, focus.c);
    linkText.value = st.link_text || formatDisplay(focus.r, focus.c) || getCell(focus.r, focus.c);
    linkUrl.value = st.link || '';
    linkDialog.classList.remove('hidden');
    linkText.focus();
  }

  function applyLink() {
    const text = linkText.value.trim();
    const url = linkUrl.value.trim();
    if (!url) {
      forEachSelected((r, c) => setStyle(r, c, { link: null, link_text: null }));
    } else {
      forEachSelected((r, c) => setStyle(r, c, { link: url, link_text: text || url }));
      if (text && !getCell(focus.r, focus.c)) setCell(focus.r, focus.c, text);
    }
    linkDialog.classList.add('hidden');
    renderGrid();
  }

  // Toolbar wiring
  $('undo-btn').addEventListener('click', undo);
  $('redo-btn').addEventListener('click', redo);
  $('print-btn').addEventListener('click', () => window.print());
  $('bold-btn').addEventListener('click', () => toggleStyleField('bold'));
  $('italic-btn').addEventListener('click', () => toggleStyleField('italic'));
  $('align-left-btn').addEventListener('click', () => setAlign('left'));
  $('align-center-btn').addEventListener('click', () => setAlign('center'));
  $('align-right-btn').addEventListener('click', () => setAlign('right'));
  $('dec-left-btn').addEventListener('click', () => bumpDecimals(-1));
  $('dec-right-btn').addEventListener('click', () => bumpDecimals(1));
  $('currency-btn').addEventListener('click', toggleCurrency);
  $('sum-btn').addEventListener('click', () => {
    const a = normalizeRange();
    const formula = `=SUM(${cellRef(a.r1, a.c1)}:${cellRef(a.r2, a.c2)})`;
    // place below selection
    const tr = a.r2 + 1;
    setCell(tr, a.c1, formula);
    selectCell(tr, a.c1);
  });

  populateFontMenu();

  textColorPicker = buildColorPicker(
    'Text color',
    (color) => {
      forEachSelected((r, c) => setStyle(r, c, { color }));
      if (textColBar) textColBar.style.background = color || '#1d1d1f';
      renderGrid();
    },
    { allowNone: false }
  );
  fillColorPicker = buildColorPicker(
    'Fill color',
    (color) => {
      forEachSelected((r, c) => setStyle(r, c, { fill: color }));
      if (fillColBar) {
        fillColBar.style.background = color || 'transparent';
        fillColBar.style.border = color ? 'none' : '1px solid var(--border)';
      }
      renderGrid();
    },
    { allowNone: true }
  );

  zoomBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu(zoomBtn, zoomMenu);
  });
  zoomMenu.querySelectorAll('[data-zoom]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      setZoom(+btn.getAttribute('data-zoom'));
      closeMenus();
    });
  });
  zoomMenu.addEventListener('click', (e) => e.stopPropagation());
  const zoomCustomInput = $('zoom-custom-input');
  const zoomCustomApply = $('zoom-custom-apply');
  if (zoomCustomApply) {
    zoomCustomApply.addEventListener('click', (e) => {
      e.stopPropagation();
      const raw = (zoomCustomInput?.value || '').replace('%', '').trim();
      setZoom(raw);
      closeMenus();
    });
  }
  if (zoomCustomInput) {
    zoomCustomInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        zoomCustomApply?.click();
      }
    });
    zoomCustomInput.addEventListener('click', (e) => e.stopPropagation());
  }

  // Ctrl / ⌘ + mouse wheel zoom over the grid
  gridViewport.addEventListener(
    'wheel',
    (e) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      const step = e.deltaY > 0 ? -10 : 10;
      setZoom(zoom + step);
    },
    { passive: false }
  );

  fontBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu(fontBtn, fontMenu);
  });

  fsMinus.addEventListener('click', () => {
    const cur = parseFloat(fsVal.value) || defaultSize;
    setFontSize(cur - 2);
  });
  fsPlus.addEventListener('click', () => {
    const cur = parseFloat(fsVal.value) || defaultSize;
    setFontSize(cur + 2);
  });
  fsVal.addEventListener('change', () => {
    const n = parseFloat(fsVal.value);
    if (Number.isFinite(n)) setFontSize(n);
    else fsVal.value = String(defaultSize);
  });
  fsVal.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      fsVal.blur();
    }
  });

  textColorBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu(textColorBtn, textColorPicker);
  });
  fillColorBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu(fillColorBtn, fillColorPicker);
  });

  linkBtn.addEventListener('click', openLinkDialog);
  linkApply.addEventListener('click', applyLink);
  linkDialog.querySelectorAll('[data-close="link"]').forEach((el) => {
    el.addEventListener('click', () => linkDialog.classList.add('hidden'));
  });

  chartBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu(chartBtn, chartMenu);
  });
  chartMenu.querySelectorAll('[data-chart]').forEach((btn) => {
    btn.addEventListener('click', () => {
      insertChart(btn.getAttribute('data-chart'));
      closeMenus();
    });
  });

  saveBtn.addEventListener('click', () => saveAs('xlsx'));
  saveMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu(saveMenuBtn, saveMenu);
  });
  saveMenu.querySelectorAll('[data-save-fmt]').forEach((btn) => {
    btn.addEventListener('click', () => {
      closeMenus();
      saveAs(btn.getAttribute('data-save-fmt'));
    });
  });

  document.querySelectorAll('[data-export]').forEach((btn) => {
    btn.addEventListener('click', () => exportFormat(btn.getAttribute('data-export')));
  });

  addSheetBtn.addEventListener('click', () => {
    sheets.push(emptySheet('Sheet' + (sheets.length + 1)));
    activeSheet = sheets.length - 1;
    anchor = focus = { r: 0, c: 0 };
    markDirty();
    renderGrid();
  });

  sidebarNew.addEventListener('click', () => newDocument());
  sidebarOpen.addEventListener('click', () => fileOpenInput.click());
  refreshFiles.addEventListener('click', () => loadFileList());
  fileOpenInput.addEventListener('change', () => {
    if (fileOpenInput.files?.length) importFiles(fileOpenInput.files);
    fileOpenInput.value = '';
  });

  starBtn.addEventListener('click', () => {
    starred = !starred;
    starBtn.setAttribute('aria-pressed', starred ? 'true' : 'false');
    markDirty();
    saveWorkbookLocal({ quiet: true });
  });

  docTitle.addEventListener('input', () => {
    setTitle(docTitle.textContent);
    markDirty();
  });

  themeToggle.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('xsheet-theme', next);
    } catch {
      /* ignore */
    }
  });

  document.addEventListener('click', () => closeMenus());
  window.addEventListener('resize', () => {
    if (openPopoverEl && openPopoverBtn) positionPopover(openPopoverBtn, openPopoverEl);
  });
  document.querySelectorAll('.tb-wrap, .save-split').forEach((el) => {
    el.addEventListener('click', (e) => e.stopPropagation());
  });
  // Keep dropdowns interactive when portaled
  [zoomMenu, fontMenu, saveMenu, chartMenu].forEach((el) => {
    if (el) el.addEventListener('click', (e) => e.stopPropagation());
  });

  ['dragenter', 'dragover'].forEach((ev) => {
    document.body.addEventListener(ev, (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
  });
  document.body.addEventListener('drop', (e) => {
    e.preventDefault();
    if (e.dataTransfer?.files?.length) importFiles(e.dataTransfer.files);
  });

  if (window.XSuiteLiquidGlass?.attach) {
    window.XSuiteLiquidGlass.attach({ scrollEl: gridViewport });
  }

  // Boot
  applyZoom();
  loadFileList();
  newDocument();
  const launchToken = new URLSearchParams(window.location.search).get('launch');
  if (launchToken) {
    (async () => {
      try {
        const res = await fetch(`${API}/files/launch?token=` + encodeURIComponent(launchToken));
        const opened = await res.json();
        if (!res.ok) throw new Error(opened.error || 'Could not open launch file');
        applyOpened(opened);
        activeFilePath = null;
        docId = null;
        await saveWorkbookLocal({ quiet: true, create: true });
        setStatus('Opened ' + opened.name);
      } catch (e) {
        setStatus(String(e.message || e), 'error');
      }
    })();
  }
})();
