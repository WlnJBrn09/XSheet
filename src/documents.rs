//! Local filesystem spreadsheet store.
//! Each workbook is a JSON file under the data directory — never leaves the machine.

use std::fs;
use std::path::{Path, PathBuf};
use std::sync::Mutex;

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

const DEFAULT_ROWS: usize = 100;
const DEFAULT_COLS: usize = 26;
const MAX_ROWS: usize = 50_000;
const MAX_COLS: usize = 500;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct CellStyle {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub bold: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub italic: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub align: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub font: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub size: Option<f64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub color: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub fill: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub decimals: Option<i32>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub currency: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub link: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub link_text: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Sheet {
    pub name: String,
    /// Row-major cell values as display strings (formulas stored with leading `=`).
    pub data: Vec<Vec<String>>,
    /// Sparse styles keyed by "row,col" (0-based).
    #[serde(default, skip_serializing_if = "std::collections::HashMap::is_empty")]
    pub styles: std::collections::HashMap<String, CellStyle>,
    /// Chart definitions used by the local editor and JSON export.
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub charts: Vec<serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Document {
    pub id: String,
    pub title: String,
    pub starred: bool,
    pub sheets: Vec<Sheet>,
    pub active_sheet: usize,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    /// Source file path when opened from Documents (relative).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub source_path: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub source_format: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DocumentMeta {
    pub id: String,
    pub title: String,
    pub starred: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub source_path: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub source_format: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct SaveDocument {
    pub title: Option<String>,
    pub sheets: Option<Vec<Sheet>>,
    pub active_sheet: Option<usize>,
    pub starred: Option<bool>,
    pub source_path: Option<String>,
    pub source_format: Option<String>,
}

#[derive(Debug)]
pub enum StoreError {
    NotFound,
    InvalidId,
    Io(std::io::Error),
    Json(serde_json::Error),
}

impl std::fmt::Display for StoreError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::NotFound => write!(f, "not found"),
            Self::InvalidId => write!(f, "invalid id"),
            Self::Io(e) => write!(f, "io: {e}"),
            Self::Json(e) => write!(f, "json: {e}"),
        }
    }
}

impl std::error::Error for StoreError {}

pub struct DocumentStore {
    root: PathBuf,
    lock: Mutex<()>,
}

impl DocumentStore {
    pub fn open(root: PathBuf) -> Result<Self, StoreError> {
        fs::create_dir_all(&root).map_err(StoreError::Io)?;
        Ok(Self {
            root,
            lock: Mutex::new(()),
        })
    }

    fn path_for(&self, id: &str) -> Result<PathBuf, StoreError> {
        validate_id(id)?;
        Ok(self.root.join(format!("{id}.json")))
    }

    pub fn list(&self) -> Result<Vec<DocumentMeta>, StoreError> {
        let _g = self.lock.lock().ok();
        let mut out = Vec::new();
        let entries = fs::read_dir(&self.root).map_err(StoreError::Io)?;
        for entry in entries.flatten() {
            let path = entry.path();
            if path.extension().and_then(|e| e.to_str()) != Some("json") {
                continue;
            }
            match read_doc(&path) {
                Ok(doc) => out.push(DocumentMeta {
                    id: doc.id,
                    title: doc.title,
                    starred: doc.starred,
                    created_at: doc.created_at,
                    updated_at: doc.updated_at,
                    source_path: doc.source_path,
                    source_format: doc.source_format,
                }),
                Err(e) => tracing::warn!(path = %path.display(), error = %e, "skip bad document"),
            }
        }
        out.sort_by(|a, b| b.updated_at.cmp(&a.updated_at));
        Ok(out)
    }

    pub fn get(&self, id: &str) -> Result<Document, StoreError> {
        let _g = self.lock.lock().ok();
        let path = self.path_for(id)?;
        if !path.exists() {
            return Err(StoreError::NotFound);
        }
        read_doc(&path)
    }

    pub fn create(&self, body: SaveDocument) -> Result<Document, StoreError> {
        let _g = self.lock.lock().ok();
        let now = Utc::now();
        let id = Uuid::new_v4().to_string();
        let sheets = body
            .sheets
            .map(normalize_sheets)
            .unwrap_or_else(|| vec![empty_sheet("Sheet1")]);
        let active = body
            .active_sheet
            .unwrap_or(0)
            .min(sheets.len().saturating_sub(1));
        let doc = Document {
            id: id.clone(),
            title: sanitize_title(body.title.unwrap_or_else(|| "Untitled spreadsheet".into())),
            starred: body.starred.unwrap_or(false),
            sheets,
            active_sheet: active,
            created_at: now,
            updated_at: now,
            source_path: body.source_path,
            source_format: body.source_format,
        };
        write_doc(&self.path_for(&id)?, &doc)?;
        Ok(doc)
    }

    pub fn update(&self, id: &str, body: SaveDocument) -> Result<Document, StoreError> {
        let _g = self.lock.lock().ok();
        let path = self.path_for(id)?;
        if !path.exists() {
            return Err(StoreError::NotFound);
        }
        let mut doc = read_doc(&path)?;
        if let Some(title) = body.title {
            doc.title = sanitize_title(title);
        }
        if let Some(sheets) = body.sheets {
            let sheets = normalize_sheets(sheets);
            // Cap serialized size ~16 MiB.
            let rough = sheets
                .iter()
                .map(|s| s.data.len() * s.data.first().map(|r| r.len()).unwrap_or(0) * 8)
                .sum::<usize>();
            if rough > 16 * 1024 * 1024 {
                return Err(StoreError::Io(std::io::Error::new(
                    std::io::ErrorKind::InvalidInput,
                    "spreadsheet too large",
                )));
            }
            doc.sheets = sheets;
        }
        if let Some(active) = body.active_sheet {
            doc.active_sheet = active.min(doc.sheets.len().saturating_sub(1));
        }
        if let Some(starred) = body.starred {
            doc.starred = starred;
        }
        if body.source_path.is_some() {
            doc.source_path = body.source_path;
        }
        if body.source_format.is_some() {
            doc.source_format = body.source_format;
        }
        doc.updated_at = Utc::now();
        write_doc(&path, &doc)?;
        Ok(doc)
    }

    pub fn delete(&self, id: &str) -> Result<(), StoreError> {
        let _g = self.lock.lock().ok();
        let path = self.path_for(id)?;
        if !path.exists() {
            return Err(StoreError::NotFound);
        }
        fs::remove_file(path).map_err(StoreError::Io)
    }
}

pub fn empty_sheet(name: &str) -> Sheet {
    Sheet {
        name: name.into(),
        data: vec![vec![String::new(); DEFAULT_COLS]; DEFAULT_ROWS],
        styles: std::collections::HashMap::new(),
        charts: Vec::new(),
    }
}

pub fn sheet_from_grid(name: &str, grid: Vec<Vec<String>>) -> Sheet {
    let mut data = grid;
    // Ensure at least default size for editing comfort.
    let rows = data.len().max(DEFAULT_ROWS).min(MAX_ROWS);
    let cols = data
        .iter()
        .map(|r| r.len())
        .max()
        .unwrap_or(DEFAULT_COLS)
        .max(DEFAULT_COLS)
        .min(MAX_COLS);
    data.resize_with(rows, || vec![String::new(); cols]);
    for row in &mut data {
        row.resize(cols, String::new());
    }
    Sheet {
        name: name.into(),
        data,
        styles: std::collections::HashMap::new(),
        charts: Vec::new(),
    }
}

fn normalize_sheets(sheets: Vec<Sheet>) -> Vec<Sheet> {
    if sheets.is_empty() {
        return vec![empty_sheet("Sheet1")];
    }
    sheets
        .into_iter()
        .enumerate()
        .map(|(i, mut s)| {
            if s.name.trim().is_empty() {
                s.name = format!("Sheet{}", i + 1);
            }
            let rows = s.data.len().min(MAX_ROWS).max(1);
            let cols = s
                .data
                .iter()
                .map(|r| r.len())
                .max()
                .unwrap_or(1)
                .min(MAX_COLS)
                .max(1);
            s.data.truncate(rows);
            s.data.resize_with(rows, || vec![String::new(); cols]);
            for row in &mut s.data {
                row.truncate(cols);
                row.resize(cols, String::new());
            }
            s
        })
        .collect()
}

fn validate_id(id: &str) -> Result<(), StoreError> {
    if id.is_empty() || id.len() > 64 {
        return Err(StoreError::InvalidId);
    }
    if !id
        .chars()
        .all(|c| c.is_ascii_alphanumeric() || c == '-' || c == '_')
    {
        return Err(StoreError::InvalidId);
    }
    Ok(())
}

fn sanitize_title(title: String) -> String {
    let t = title.trim();
    if t.is_empty() {
        "Untitled spreadsheet".into()
    } else {
        t.chars().take(200).collect()
    }
}

fn read_doc(path: &Path) -> Result<Document, StoreError> {
    let raw = fs::read_to_string(path).map_err(StoreError::Io)?;
    serde_json::from_str(&raw).map_err(StoreError::Json)
}

fn write_doc(path: &Path, doc: &Document) -> Result<(), StoreError> {
    let raw = serde_json::to_string_pretty(doc).map_err(StoreError::Json)?;
    let tmp = path.with_extension("json.tmp");
    fs::write(&tmp, raw.as_bytes()).map_err(StoreError::Io)?;
    fs::rename(&tmp, path).map_err(StoreError::Io)
}
