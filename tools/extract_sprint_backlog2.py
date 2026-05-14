#!/usr/bin/env python3
"""Extract スプリントバックログ 2 from Tram spec xlsx using stdlib only."""
import re
import sys
import zipfile
from pathlib import Path
import xml.etree.ElementTree as ET

NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}


def col_row(cell_ref: str):
    m = re.match(r"^([A-Z]+)(\d+)$", cell_ref)
    if not m:
        return 0, 0
    col, row = m.group(1), int(m.group(2))
    n = 0
    for ch in col:
        n = n * 26 + (ord(ch) - ord("A") + 1)
    return row, n


def load_shared_strings(z: zipfile.ZipFile) -> list[str]:
    try:
        data = z.read("xl/sharedStrings.xml")
    except KeyError:
        return []
    root = ET.fromstring(data)
    out: list[str] = []
    for si in root.findall("m:si", NS):
        texts: list[str] = []
        for t in si.findall(".//m:t", NS):
            if t.text:
                texts.append(t.text)
        out.append("".join(texts))
    return out


def cell_value(c, shared: list[str]) -> str:
    t = c.get("t")
    v_el = c.find("m:v", NS)
    if v_el is None or v_el.text is None:
        return ""
    v = v_el.text
    if t == "s":
        try:
            return shared[int(v)]
        except (ValueError, IndexError):
            return v
    return v


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    xlsx = root / "ミシ_システム仕様書（トラム）.xlsx"
    if not xlsx.exists():
        print("xlsx not found", file=sys.stderr)
        return 1

    with zipfile.ZipFile(xlsx) as z:
        shared = load_shared_strings(z)
        wb = ET.fromstring(z.read("xl/workbook.xml"))
        sheets = []
        for sh in wb.findall("m:sheets/m:sheet", NS):
            sheets.append((sh.get("name"), sh.get("{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id")))

        rels = ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
        rid_to_target = {}
        for rel in rels.findall("{http://schemas.openxmlformats.org/package/2006/relationships}Relationship"):
            rid_to_target[rel.get("Id")] = rel.get("Target")

        # map sheet name -> worksheet path
        name_to_path = {}
        for name, rid in sheets:
            tgt = rid_to_target.get(rid, "")
            if tgt.startswith("/"):
                tgt = tgt[1:]
            if not tgt.startswith("xl/"):
                tgt = "xl/" + tgt.lstrip("/")
            name_to_path[name] = tgt

        target_name = "スプリントバックログ 2"
        if target_name not in name_to_path:
            print("Sheets:", list(name_to_path.keys()), file=sys.stderr)
            return 1
        ws_path = name_to_path[target_name]
        ws_root = ET.fromstring(z.read(ws_path))

        rows: dict[int, dict[int, str]] = {}
        max_col = 0
        for row_el in ws_root.findall(".//m:sheetData/m:row", NS):
            r_idx = int(row_el.get("r", "0"))
            for c in row_el.findall("m:c", NS):
                ref = c.get("r")
                if not ref:
                    continue
                rr, cc = col_row(ref)
                val = cell_value(c, shared).strip()
                if not val:
                    continue
                rows.setdefault(rr, {})[cc] = val
                max_col = max(max_col, cc)

        print(f"=== {target_name} ({ws_path}) ===\n")
        for r in sorted(rows.keys()):
            line_parts = []
            for c in range(1, max_col + 1):
                line_parts.append(rows[r].get(c, ""))
            # trim trailing empties
            while line_parts and line_parts[-1] == "":
                line_parts.pop()
            if any(x.strip() for x in line_parts):
                print(f"R{r}:\t" + "\t|\t".join(line_parts))

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
