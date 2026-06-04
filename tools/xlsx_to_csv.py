#!/usr/bin/env python3
"""Export every sheet from ミシ_システム仕様書（トラム）.xlsx to CSV files (English names)."""
from __future__ import annotations

import csv
import re
import sys
import unicodedata
import zipfile
from pathlib import Path
import xml.etree.ElementTree as ET

NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}

SHEET_ENGLISH: dict[str, str] = {
    "システム概要": "system_overview",
    "画面遷移図": "screen_transition_diagram",
    "画面設計書": "screen_design_document",
    "仕様書チェックリスト": "specification_checklist",
    "プロダクトバックログ": "product_backlog",
    "プロダクトバックログチェックリスト": "product_backlog_checklist",
    "スプリントバックログ 1": "sprint_backlog_1",
    "スプリントバックログ 2": "sprint_backlog_2",
    "スプリントバックログ作成チェックリスト": "sprint_backlog_creation_checklist",
    "スプリントプランニングチェックリスト": "sprint_planning_checklist",
    "スプリントレビュー準備チェックリスト（開発T用）": "sprint_review_prep_checklist_dev_team",
    "スプリントレビューチェックリスト": "sprint_review_checklist",
}


def col_row(cell_ref: str) -> tuple[int, int]:
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


def cell_value(c: ET.Element, shared: list[str]) -> str:
    t = c.get("t")
    if t == "inlineStr":
        texts: list[str] = []
        for node in c.findall(".//m:t", NS):
            if node.text:
                texts.append(node.text)
        return "".join(texts)
    v_el = c.find("m:v", NS)
    if v_el is None or v_el.text is None:
        return ""
    v = v_el.text
    if t == "s":
        try:
            return shared[int(v)]
        except (ValueError, IndexError):
            return v
    if t == "b":
        return "TRUE" if v == "1" else "FALSE"
    return v


def slugify(name: str, used: set[str]) -> str:
    name = name.strip()
    if name in SHEET_ENGLISH:
        base = SHEET_ENGLISH[name]
    else:
        base = name.strip()
        for jp, en in (
            ("スプリント", "sprint"),
            ("バックログ", "backlog"),
            ("仕様", "spec"),
            ("一覧", "list"),
            ("設計", "design"),
        ):
            base = base.replace(jp, f"_{en}_")
        ascii_parts = re.findall(r"[A-Za-z0-9]+", base)
        if ascii_parts:
            base = "_".join(p.lower() for p in ascii_parts)
        else:
            nfkd = unicodedata.normalize("NFKD", name)
            base = re.sub(r"[^\w\s-]", "", nfkd, flags=re.UNICODE)
            base = re.sub(r"[-\s]+", "_", base).strip("_").lower()
        if not base or base == "_":
            base = "sheet"
    base = re.sub(r"_+", "_", base).strip("_")
    candidate = base
    n = 2
    while candidate in used:
        candidate = f"{base}_{n}"
        n += 1
    used.add(candidate)
    return candidate


def parse_sheet(ws_root: ET.Element, shared: list[str]) -> tuple[list[list[str]], int, int]:
    rows: dict[int, dict[int, str]] = {}
    max_col = 0
    max_row = 0
    for row_el in ws_root.findall(".//m:sheetData/m:row", NS):
        r_idx = int(row_el.get("r", "0"))
        for c in row_el.findall("m:c", NS):
            ref = c.get("r")
            if not ref:
                continue
            rr, cc = col_row(ref)
            val = cell_value(c, shared)
            rows.setdefault(rr, {})[cc] = val
            max_col = max(max_col, cc)
            max_row = max(max_row, rr)
    grid: list[list[str]] = []
    for r in range(1, max_row + 1):
        grid.append([rows.get(r, {}).get(c, "") for c in range(1, max_col + 1)])
    return grid, max_row, max_col


def workbook_sheets(z: zipfile.ZipFile) -> list[tuple[str, str]]:
    wb = ET.fromstring(z.read("xl/workbook.xml"))
    sheets: list[tuple[str, str]] = []
    for sh in wb.findall("m:sheets/m:sheet", NS):
        sheets.append(
            (
                (sh.get("name") or "").strip(),
                sh.get("{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id") or "",
            )
        )
    rels = ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
    rid_to_target: dict[str, str] = {}
    for rel in rels.findall("{http://schemas.openxmlformats.org/package/2006/relationships}Relationship"):
        rid_to_target[rel.get("Id") or ""] = rel.get("Target") or ""
    out: list[tuple[str, str]] = []
    for name, rid in sheets:
        tgt = rid_to_target.get(rid, "")
        if tgt.startswith("/"):
            tgt = tgt[1:]
        if not tgt.startswith("xl/"):
            tgt = "xl/" + tgt.lstrip("/")
        out.append((name, tgt))
    return out


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    xlsx = root / "ミシ_システム仕様書（トラム）.xlsx"
    out_dir = root / "csv"
    if not xlsx.exists():
        print(f"xlsx not found: {xlsx}", file=sys.stderr)
        return 1

    out_dir.mkdir(parents=True, exist_ok=True)
    used_names: set[str] = set()
    manifest: list[tuple[str, str, int, int]] = []

    with zipfile.ZipFile(xlsx) as z:
        shared = load_shared_strings(z)
        for sheet_name, ws_path in workbook_sheets(z):
            try:
                ws_root = ET.fromstring(z.read(ws_path))
            except KeyError:
                print(f"skip missing worksheet: {sheet_name} ({ws_path})", file=sys.stderr)
                continue
            grid, nrows, ncols = parse_sheet(ws_root, shared)
            en_name = slugify(sheet_name, used_names)
            csv_path = out_dir / f"{en_name}.csv"
            with csv_path.open("w", encoding="utf-8-sig", newline="") as f:
                csv.writer(f).writerows(grid)
            manifest.append((sheet_name, en_name, nrows, ncols))
            print(f"{en_name}.csv ({nrows} rows x {ncols} cols)", flush=True)

    index_path = out_dir / "_sheets_index.txt"
    with index_path.open("w", encoding="utf-8") as f:
        f.write("Japanese sheet name\tEnglish CSV\trows\tcols\n")
        for jp, en, nr, nc in manifest:
            f.write(f"{jp}\t{en}.csv\t{nr}\t{nc}\n")
    print(f"\nWrote {len(manifest)} sheets to {out_dir.resolve()}", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
