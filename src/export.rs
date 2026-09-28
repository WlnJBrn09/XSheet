//! Export spreadsheet to csv / tsv / xlsx (minimal OOXML) / json.

use std::io::{Cursor, Write};

use serde::Deserialize;
use zip::write::SimpleFileOptions;
use zip::ZipWriter;

use crate::documents::{CellStyle, Sheet};

#[derive(Debug, Deserialize)]
pub struct ExportBody {
    pub format: String,
    pub title: Option<String>,
    pub sheets: Vec<Sheet>,
    pub active_sheet: Option<usize>,
}

#[derive(Debug)]
pub struct ExportFile {
    pub filename: String,
    pub content_type: String,
    pub bytes: Vec<u8>,
}

#[derive(Debug)]
pub enum ExportError {
    Unsupported,
    Other(String),
}

impl std::fmt::Display for ExportError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Unsupported => write!(f, "unsupported export format"),
            Self::Other(s) => write!(f, "{s}"),
        }
    }
}

pub fn export_document(body: &ExportBody) -> Result<ExportFile, ExportError> {
    let title = sanitize_filename(body.title.as_deref().unwrap_or("spreadsheet"));
    let idx = body
        .active_sheet
        .unwrap_or(0)
        .min(body.sheets.len().saturating_sub(1));
    let sheet = body
        .sheets
        .get(idx)
        .ok_or_else(|| ExportError::Other("no sheets".into()))?;

    match body.format.to_lowercase().as_str() {
        "csv" => Ok(ExportFile {
            filename: format!("{title}.csv"),
            content_type: "text/csv; charset=utf-8".into(),
            bytes: grid_to_csv(&sheet.data, b',').into_bytes(),
        }),
        "tsv" => Ok(ExportFile {
            filename: format!("{title}.tsv"),
            content_type: "text/tab-separated-values; charset=utf-8".into(),
            bytes: grid_to_csv(&sheet.data, b'\t').into_bytes(),
        }),
        "json" => {
            let json = serde_json::to_vec_pretty(&serde_json::json!({
                "title": body.title,
                "sheets": body.sheets,
                "active_sheet": idx,
            }))
            .map_err(|e| ExportError::Other(e.to_string()))?;
            Ok(ExportFile {
                filename: format!("{title}.json"),
                content_type: "application/json".into(),
                bytes: json,
            })
        }
        "xlsx" => {
            let bytes = build_xlsx(&body.sheets).map_err(ExportError::Other)?;
            Ok(ExportFile {
                filename: format!("{title}.xlsx"),
                content_type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    .into(),
                bytes,
            })
        }
        _ => Err(ExportError::Unsupported),
    }
}

fn sanitize_filename(s: &str) -> String {
    let t: String = s
        .chars()
        .map(|c| {
            // Keep letters from every script; headers carry them via RFC 5987 `filename*`.
            if c.is_alphanumeric() || c == '-' || c == '_' || c == ' ' {
                c
            } else {
                '_'
            }
        })
        .collect();
    let t = t.trim().trim_matches('.');
    if t.is_empty() {
        "spreadsheet".into()
    } else {
        t.chars().take(80).collect()
    }
}

fn grid_to_csv(data: &[Vec<String>], delim: u8) -> String {
    let d = delim as char;
    let mut out = String::new();
    let used_rows = data
        .iter()
        .rposition(|r| r.iter().any(|c| !c.is_empty()))
        .map_or(1, |i| i + 1);
    let used_cols = data
        .iter()
        .take(used_rows)
        .filter_map(|r| r.iter().rposition(|c| !c.is_empty()))
        .max()
        .map_or(1, |i| i + 1);
    for row in data.iter().take(used_rows) {
        let mut first = true;
        for ci in 0..used_cols {
            let cell = row.get(ci).map(String::as_str).unwrap_or("");
            if !first {
                out.push(d);
            }
            first = false;
            out.push_str(&csv_escape(cell, delim));
        }
        out.push('\n');
    }
    out
}

fn csv_escape(s: &str, delim: u8) -> String {
    let d = delim as char;
    let needs = s.contains(d) || s.contains('"') || s.contains('\n') || s.contains('\r');
    if !needs {
        return s.to_string();
    }
    format!("\"{}\"", s.replace('"', "\"\""))
}

fn build_xlsx(sheets: &[Sheet]) -> Result<Vec<u8>, String> {
    if sheets.is_empty() {
        return Err("workbook has no sheets".into());
    }
    let names = unique_excel_sheet_names(sheets);
    let (styles_xml, cell_styles) = build_styles(sheets);
    let mut buf = Cursor::new(Vec::new());
    {
        let mut zip = ZipWriter::new(&mut buf);
        let opts = SimpleFileOptions::default().compression_method(zip::CompressionMethod::Stored);

        // [Content_Types].xml
        let mut ctypes = String::from(
            r#"<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
"#,
        );
        for i in 0..sheets.len() {
            ctypes.push_str(&format!(
                r#"  <Override PartName="/xl/worksheets/sheet{}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
"#,
                i + 1
            ));
        }
        ctypes.push_str("</Types>");
        zip.start_file("[Content_Types].xml", opts)
            .map_err(|e| e.to_string())?;
        zip.write_all(ctypes.as_bytes())
            .map_err(|e| e.to_string())?;

        // _rels/.rels
        zip.start_file("_rels/.rels", opts)
            .map_err(|e| e.to_string())?;
        zip.write_all(
            br#"<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>"#,
        )
        .map_err(|e| e.to_string())?;

        // xl/workbook.xml
        let mut wb = String::from(
            r#"<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
 xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
"#,
        );
        for (i, name) in names.iter().enumerate() {
            wb.push_str(&format!(
                r#"    <sheet name="{}" sheetId="{}" r:id="rId{}"/>
"#,
                xml_escape(name),
                i + 1,
                i + 1
            ));
        }
        wb.push_str("  </sheets>\n</workbook>");
        zip.start_file("xl/workbook.xml", opts)
            .map_err(|e| e.to_string())?;
        zip.write_all(wb.as_bytes()).map_err(|e| e.to_string())?;

        zip.start_file("xl/styles.xml", opts)
            .map_err(|e| e.to_string())?;
        zip.write_all(styles_xml.as_bytes())
            .map_err(|e| e.to_string())?;

        // xl/_rels/workbook.xml.rels
        let mut rels = String::from(
            r#"<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
"#,
        );
        for i in 0..sheets.len() {
            rels.push_str(&format!(
                r#"  <Relationship Id="rId{}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet{}.xml"/>
"#,
                i + 1,
                i + 1
            ));
        }
        rels.push_str(&format!(r#"  <Relationship Id="rId{}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
"#, sheets.len() + 1));
        rels.push_str("</Relationships>");
        zip.start_file("xl/_rels/workbook.xml.rels", opts)
            .map_err(|e| e.to_string())?;
        zip.write_all(rels.as_bytes()).map_err(|e| e.to_string())?;

        // worksheets
        for (i, sheet) in sheets.iter().enumerate() {
            let xml = sheet_to_xml(sheet, &cell_styles[i]);
            zip.start_file(format!("xl/worksheets/sheet{}.xml", i + 1), opts)
                .map_err(|e| e.to_string())?;
            zip.write_all(xml.as_bytes()).map_err(|e| e.to_string())?;
        }

        zip.finish().map_err(|e| e.to_string())?;
    }
    Ok(buf.into_inner())
}

fn sheet_to_xml(
    sheet: &Sheet,
    styles: &std::collections::HashMap<(usize, usize), usize>,
) -> String {
    let styled_rows: std::collections::HashSet<usize> =
        styles.keys().map(|(row, _)| *row).collect();
    let mut body = String::from(
        r#"<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>
"#,
    );
    for (ri, row) in sheet.data.iter().enumerate() {
        let row_num = ri + 1;
        // Skip fully empty rows
        if row.iter().all(|c| c.is_empty()) && !styled_rows.contains(&ri) {
            continue;
        }
        body.push_str(&format!("    <row r=\"{row_num}\">\n"));
        for (ci, cell) in row.iter().enumerate() {
            let style_id = styles.get(&(ri, ci));
            if cell.is_empty() && style_id.is_none() {
                continue;
            }
            let ref_ = cell_ref(ci, ri);
            let style_attr = style_id
                .map(|id| format!(" s=\"{id}\""))
                .unwrap_or_default();
            if cell.is_empty() {
                body.push_str(&format!("      <c r=\"{ref_}\"{style_attr}/>\n"));
                continue;
            }
            if let Some(formula) = cell.strip_prefix('=') {
                if !formula.is_empty() {
                    body.push_str(&format!(
                        "      <c r=\"{ref_}\"{style_attr}><f>{}</f></c>\n",
                        xml_escape(formula)
                    ));
                    continue;
                }
            }
            if let Ok(n) = cell.parse::<f64>() {
                if n.is_finite() && n.to_string() == *cell {
                    body.push_str(&format!(
                        "      <c r=\"{ref_}\"{style_attr}><v>{n}</v></c>\n"
                    ));
                    continue;
                }
            }
            // inline string
            body.push_str(&format!(
                "      <c r=\"{ref_}\"{style_attr} t=\"inlineStr\"><is><t xml:space=\"preserve\">{}</t></is></c>\n",
                xml_escape(cell)
            ));
        }
        body.push_str("    </row>\n");
    }
    body.push_str("  </sheetData>\n</worksheet>");
    body
}

fn build_styles(
    sheets: &[Sheet],
) -> (
    String,
    Vec<std::collections::HashMap<(usize, usize), usize>>,
) {
    use std::collections::HashMap;
    let mut unique = Vec::<CellStyle>::new();
    let mut ids = HashMap::<String, usize>::new();
    let mut cell_styles = Vec::new();
    for sheet in sheets {
        let mut cells = HashMap::new();
        for (key, style) in &sheet.styles {
            let Some((row, col)) = key.split_once(',') else {
                continue;
            };
            let (Ok(row), Ok(col)) = (row.parse::<usize>(), col.parse::<usize>()) else {
                continue;
            };
            let serial = serde_json::to_string(style).unwrap_or_default();
            let id = *ids.entry(serial).or_insert_with(|| {
                unique.push(style.clone());
                unique.len()
            });
            cells.insert((row, col), id);
        }
        cell_styles.push(cells);
    }
    let mut xml = String::from("<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><styleSheet xmlns=\"http://schemas.openxmlformats.org/spreadsheetml/2006/main\">");
    let formats = unique
        .iter()
        .enumerate()
        .filter_map(|(i, st)| {
            let digits = st
                .decimals
                .or_else(|| st.currency.as_ref().map(|_| 2))?
                .clamp(0, 10) as usize;
            let fraction = if digits == 0 {
                String::new()
            } else {
                format!(".{}", "0".repeat(digits))
            };
            let code = if let Some(currency) = &st.currency {
                let currency: String = currency
                    .chars()
                    .filter(|c| c.is_ascii_alphanumeric() || *c == '$' || *c == '€')
                    .take(8)
                    .collect();
                format!("\"{currency} \"#,##0{fraction}")
            } else {
                format!("0{fraction}")
            };
            Some((164 + i, code))
        })
        .collect::<Vec<_>>();
    xml.push_str(&format!("<numFmts count=\"{}\">", formats.len()));
    for (id, code) in &formats {
        xml.push_str(&format!(
            "<numFmt numFmtId=\"{id}\" formatCode=\"{}\"/>",
            xml_escape(code)
        ));
    }
    xml.push_str("</numFmts>");
    xml.push_str(&format!(
        "<fonts count=\"{}\"><font><sz val=\"11\"/><name val=\"Calibri\"/></font>",
        unique.len() + 1
    ));
    for st in &unique {
        xml.push_str("<font>");
        if st.bold == Some(true) {
            xml.push_str("<b/>");
        }
        if st.italic == Some(true) {
            xml.push_str("<i/>");
        }
        let size = st
            .size
            .filter(|n| n.is_finite())
            .unwrap_or(11.0)
            .clamp(1.0, 200.0);
        xml.push_str(&format!("<sz val=\"{size}\"/>"));
        if let Some(color) = st.color.as_deref().and_then(argb_color) {
            xml.push_str(&format!("<color rgb=\"{color}\"/>"));
        }
        xml.push_str(&format!(
            "<name val=\"{}\"/></font>",
            xml_escape(st.font.as_deref().unwrap_or("Calibri"))
        ));
    }
    xml.push_str("</fonts>");
    xml.push_str(&format!("<fills count=\"{}\"><fill><patternFill patternType=\"none\"/></fill><fill><patternFill patternType=\"gray125\"/></fill>", unique.len() + 2));
    for st in &unique {
        if let Some(color) = st.fill.as_deref().and_then(argb_color) {
            xml.push_str(&format!("<fill><patternFill patternType=\"solid\"><fgColor rgb=\"{color}\"/><bgColor indexed=\"64\"/></patternFill></fill>"));
        } else {
            xml.push_str("<fill><patternFill patternType=\"none\"/></fill>");
        }
    }
    xml.push_str("</fills><borders count=\"1\"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count=\"1\"><xf numFmtId=\"0\" fontId=\"0\" fillId=\"0\" borderId=\"0\"/></cellStyleXfs>");
    xml.push_str(&format!("<cellXfs count=\"{}\"><xf numFmtId=\"0\" fontId=\"0\" fillId=\"0\" borderId=\"0\" xfId=\"0\"/>", unique.len() + 1));
    for (i, st) in unique.iter().enumerate() {
        let num_fmt_id = if st.decimals.is_some() || st.currency.is_some() {
            164 + i
        } else {
            0
        };
        let align = match st.align.as_deref() {
            Some("left") => Some("left"),
            Some("center") => Some("center"),
            Some("right") => Some("right"),
            Some("justify") => Some("justify"),
            _ => None,
        };
        xml.push_str(&format!("<xf numFmtId=\"{num_fmt_id}\" fontId=\"{}\" fillId=\"{}\" borderId=\"0\" xfId=\"0\" applyFont=\"1\" applyFill=\"1\" applyNumberFormat=\"1\"", i + 1, i + 2));
        if let Some(align) = align {
            xml.push_str(&format!(
                " applyAlignment=\"1\"><alignment horizontal=\"{align}\"/></xf>"
            ));
        } else {
            xml.push_str("/>");
        }
    }
    xml.push_str("</cellXfs><cellStyles count=\"1\"><cellStyle name=\"Normal\" xfId=\"0\" builtinId=\"0\"/></cellStyles></styleSheet>");
    (xml, cell_styles)
}

fn argb_color(value: &str) -> Option<String> {
    let hex = value.strip_prefix('#')?;
    if hex.len() == 6 && hex.chars().all(|c| c.is_ascii_hexdigit()) {
        Some(format!("FF{}", hex.to_ascii_uppercase()))
    } else {
        None
    }
}

fn cell_ref(col: usize, row: usize) -> String {
    format!("{}{}", col_letters(col), row + 1)
}

fn col_letters(mut col: usize) -> String {
    let mut s = String::new();
    loop {
        let rem = col % 26;
        s.insert(0, (b'A' + rem as u8) as char);
        if col < 26 {
            break;
        }
        col = col / 26 - 1;
    }
    s
}

fn xml_escape(s: &str) -> String {
    s.chars()
        .filter(|c| matches!(*c, '\t' | '\n' | '\r') || *c >= ' ')
        .collect::<String>()
        .replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
}

fn excel_sheet_name(name: &str, index: usize) -> String {
    let cleaned: String = name
        .chars()
        .filter(|c| !matches!(c, '[' | ']' | ':' | '*' | '?' | '/' | '\\'))
        .take(31)
        .collect();
    let cleaned = cleaned.trim_matches('\'').trim();
    if cleaned.is_empty() {
        format!("Sheet{}", index + 1)
    } else {
        cleaned.into()
    }
}

fn unique_excel_sheet_names(sheets: &[Sheet]) -> Vec<String> {
    let mut seen = std::collections::HashSet::new();
    let mut result = Vec::new();
    for (index, sheet) in sheets.iter().enumerate() {
        let base = excel_sheet_name(&sheet.name, index);
        let mut candidate = base.clone();
        let mut suffix = 2;
        while !seen.insert(candidate.to_lowercase()) {
            let tail = format!(" ({suffix})");
            let prefix: String = base.chars().take(31 - tail.len()).collect();
            candidate = format!("{prefix}{tail}");
            suffix += 1;
        }
        result.push(candidate);
    }
    result
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn col_a() {
        assert_eq!(col_letters(0), "A");
        assert_eq!(col_letters(25), "Z");
        assert_eq!(col_letters(26), "AA");
    }

    #[test]
    fn csv_basic() {
        let g = vec![vec!["a".into(), "b".into()], vec!["1".into(), "2".into()]];
        let s = grid_to_csv(&g, b',');
        assert!(s.contains("a,b"));
    }

    #[test]
    fn xlsx_round_trip_keeps_cell_positions_and_text() {
        let sheet = Sheet {
            name: "Data".into(),
            data: vec![
                vec!["00123".into(), "  spaced  ".into(), "=SUM(1,2)".into()],
                vec![],
                vec![String::new(), "B3".into()],
            ],
            styles: Default::default(),
            charts: Vec::new(),
        };
        let bytes = build_xlsx(&[sheet]).unwrap();
        let opened =
            crate::files::open_bytes("test.xlsx", "test.xlsx", "xlsx", "test", &bytes).unwrap();
        assert_eq!(opened.sheets[0].data[0][0], "00123");
        assert_eq!(opened.sheets[0].data[0][1], "  spaced  ");
        assert_eq!(opened.sheets[0].data[0][2], "=SUM(1,2)");
        assert_eq!(opened.sheets[0].data[2][1], "B3");
    }

    #[test]
    fn csv_trims_blank_tail_and_opens_bom() {
        let csv = grid_to_csv(&[vec!["a".into()], vec![String::new()]], b',');
        assert_eq!(csv, "a\n");
        let opened =
            crate::files::open_bytes("t.csv", "t.csv", "csv", "t", b"\xef\xbb\xbfa,b\n").unwrap();
        assert_eq!(opened.sheets[0].data[0][0], "a");
        let opened_utf16 =
            crate::files::open_bytes("t.csv", "t.csv", "csv", "t", b"\xff\xfea\0,\0b\0\n\0")
                .unwrap();
        assert_eq!(&opened_utf16.sheets[0].data[0][..2], ["a", "b"]);
    }

    #[test]
    fn sparse_excel_origin_is_preserved() {
        let sheet = Sheet {
            name: "Sparse".into(),
            data: vec![vec![], vec![], vec![String::new(), "B3".into()]],
            styles: Default::default(),
            charts: Vec::new(),
        };
        let bytes = build_xlsx(&[sheet]).unwrap();
        let opened = crate::files::open_bytes("s.xlsx", "s.xlsx", "xlsx", "s", &bytes).unwrap();
        assert_eq!(opened.sheets[0].data[2][1], "B3");
        assert!(opened.sheets[0].data[0][0].is_empty());
    }

    #[test]
    fn json_keeps_charts_and_active_sheet() {
        let chart = serde_json::json!({"id":"chart1","type":"bar","values":[2,3]});
        let sheets = vec![
            Sheet {
                name: "One".into(),
                data: vec![vec!["1".into()]],
                styles: Default::default(),
                charts: vec![],
            },
            Sheet {
                name: "Two".into(),
                data: vec![vec!["2".into()]],
                styles: Default::default(),
                charts: vec![chart.clone()],
            },
        ];
        let exported = export_document(&ExportBody {
            format: "json".into(),
            title: Some("Book".into()),
            sheets,
            active_sheet: Some(1),
        })
        .unwrap();
        let opened =
            crate::files::open_bytes("book.json", "book.json", "json", "book", &exported.bytes)
                .unwrap();
        assert_eq!(opened.active_sheet, 1);
        assert_eq!(opened.title, "Book");
        assert_eq!(opened.sheets[1].charts, vec![chart]);
    }

    #[test]
    fn xlsx_renames_colliding_sheet_names() {
        let names = ["A/B", "AB", "ab"];
        let sheets = names
            .iter()
            .map(|n| Sheet {
                name: (*n).into(),
                data: vec![vec!["x".into()]],
                styles: Default::default(),
                charts: Vec::new(),
            })
            .collect::<Vec<_>>();
        let bytes = build_xlsx(&sheets).unwrap();
        let opened = crate::files::open_bytes("s.xlsx", "s.xlsx", "xlsx", "s", &bytes).unwrap();
        assert_eq!(
            opened
                .sheets
                .iter()
                .map(|s| s.name.as_str())
                .collect::<Vec<_>>(),
            ["AB", "AB (2)", "ab (3)"]
        );
    }

    #[test]
    fn xlsx_writes_cell_styles_including_blank_cells() {
        use std::io::Read;
        let mut styles = std::collections::HashMap::new();
        styles.insert(
            "0,0".into(),
            CellStyle {
                bold: Some(true),
                fill: Some("#ffee00".into()),
                decimals: Some(2),
                ..Default::default()
            },
        );
        styles.insert(
            "1,0".into(),
            CellStyle {
                color: Some("#112233".into()),
                ..Default::default()
            },
        );
        let sheet = Sheet {
            name: "Styled".into(),
            data: vec![vec!["2".into()], vec![String::new()]],
            styles,
            charts: Vec::new(),
        };
        let bytes = build_xlsx(&[sheet]).unwrap();
        let mut zip = zip::ZipArchive::new(Cursor::new(bytes)).unwrap();
        let mut style_xml = String::new();
        zip.by_name("xl/styles.xml")
            .unwrap()
            .read_to_string(&mut style_xml)
            .unwrap();
        assert!(style_xml.contains("<b/>"));
        assert!(style_xml.contains("FFFFEE00"));
        assert!(style_xml.contains("FF112233"));
        drop(style_xml);
        let mut sheet_xml = String::new();
        zip.by_name("xl/worksheets/sheet1.xml")
            .unwrap()
            .read_to_string(&mut sheet_xml)
            .unwrap();
        assert!(sheet_xml.contains("<c r=\"A1\" s=\""));
        assert!(sheet_xml.contains("<c r=\"A2\" s=\""));
    }
}
