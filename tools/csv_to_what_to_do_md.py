#!/usr/bin/env python3
"""Convert csv/*.csv sheets to actionable 'What to do' Markdown in md/."""
from __future__ import annotations

import csv
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSV_DIR = ROOT / "csv"
MD_DIR = ROOT / "md"

TITLES: dict[str, str] = {
    "system_overview": "System Overview",
    "screen_transition_diagram": "Screen Transition Diagram",
    "screen_design_document": "Screen Design Document",
    "specification_checklist": "Specification Checklist",
    "product_backlog": "Product Backlog",
    "product_backlog_checklist": "Product Backlog Checklist",
    "sprint_backlog_1": "Sprint Backlog 1",
    "sprint_backlog_2": "Sprint Backlog 2",
    "sprint_backlog_creation_checklist": "Sprint Backlog Creation Checklist",
    "sprint_planning_checklist": "Sprint Planning Checklist",
    "sprint_review_prep_checklist_dev_team": "Sprint Review Prep Checklist (Dev Team)",
    "sprint_review_checklist": "Sprint Review Checklist",
}

SECTION_MARKERS = ("◆", "■", "●")

OVERVIEW_SECTIONS = frozenset(
    {
        "1.問題",
        "2.想定ユーザー",
        "3.課題・解決策",
        "4.アプリ名称",
        "5.ロール一覧",
        "6.機能一覧",
        "7.画面一覧",
    }
)


def load_csv(path: Path) -> list[list[str]]:
    with path.open(encoding="utf-8-sig", newline="") as f:
        return list(csv.reader(f))


def norm(s: str) -> str:
    return re.sub(r"\s+", " ", (s or "").strip())


def nonempty(row: list[str]) -> list[str]:
    return [c.strip() for c in row if c and c.strip()]


def row_text(row: list[str]) -> str:
    return " ".join(norm(c) for c in row if norm(c))


def is_section_row(row: list[str]) -> str | None:
    for c in row:
        t = (c or "").strip()
        if t.startswith(SECTION_MARKERS):
            return t.lstrip("◆■● ").strip()
    return None


def md_escape(text: str) -> str:
    return text.replace("|", "\\|")


def md_block(text: str) -> str:
    t = (text or "").strip()
    if not t:
        return ""
    if "\n" in t:
        return "\n".join(f"> {line}" if line else ">" for line in t.splitlines())
    return t


def front_matter(title: str, source: str) -> list[str]:
    return [f"# {title} — What to do", "", f"> Source: `{source}`", ""]


def emit_items(lines: list[str], section: str | None, items: list[dict[str, str]]) -> None:
    if not items:
        return
    if section:
        lines.extend(["", f"## {section}", ""])
    for it in items:
        heading = it.get("title") or (it.get("what") or "")[:80]
        if not heading:
            continue
        lines.append(f"### {md_escape(heading)}")
        lines.append("")
        if it.get("what"):
            lines.append(f"**What to do:** {md_escape(it['what'])}")
            lines.append("")
        for key, label in (
            ("criteria", "Criteria"),
            ("assignee", "Assignee"),
            ("estimate", "Estimate"),
            ("priority", "Priority"),
            ("status", "Status"),
            ("context", "Context"),
            ("notes", "Notes"),
        ):
            if it.get(key):
                lines.append(f"**{label}:**")
                lines.append("")
                lines.append(md_block(it[key]))
                lines.append("")


def col_index(row: list[str], *needles: str) -> int | None:
    for j, cell in enumerate(row):
        low = norm(cell).lower()
        for n in needles:
            if n.lower() in low or n in cell:
                return j
    return None


def build_map(header: list[str]) -> dict[str, int]:
    m: dict[str, int] = {}
    pairs = (
        ("no", ("no.", "no")),
        ("pid", ("対応p_id", "p_id")),
        ("id", ("^id$",)),
        ("task", ("タスク", "task")),
        ("feature", ("機能", "chức năng")),
        ("story", ("ユーザーストーリー", "user story")),
        ("priority", ("優先度", "ưu tiên")),
        ("acceptance", ("受入条件", "tiếp nhận")),
        ("status", ("ステータス", "status")),
        ("pic", ("pic",)),
        ("estimate", ("見積", "estimate")),
        ("check_item", ("確認項目", "mục check")),
        ("what", ("確認すること", "すること", "nội dung check", "todo")),
        ("viewpoint", ("観点", "quan điểm", "giải thích")),
        ("criteria", ("判断材料", "căn cứ")),
        ("sheet", ("シート名", "tên sheet")),
    )
    for key, needles in pairs:
        for j, cell in enumerate(header):
            low = norm(cell).lower()
            for n in needles:
                nlow = n.lower()
                if n.startswith("^") and re.search(n, low, re.I):
                    m[key] = j
                    break
                if nlow in low or n in cell:
                    if key == "id" and "p_id" in low.replace(" ", ""):
                        continue
                    m[key] = j
                    break
            if key in m:
                break
    return m


def first_data_col(row: list[str]) -> int:
    for j, c in enumerate(row):
        if norm(c):
            return j
    return 0


def rel(row: list[str], idx: int | None) -> str:
    if idx is None or idx >= len(row):
        return ""
    return row[idx].strip()


def parse_sprint_backlog(rows: list[list[str]], title: str) -> list[str]:
    lines = front_matter(title, "csv/sprint_backlog.csv")
    section: str | None = "Sprint planning"
    items: list[dict[str, str]] = []
    cmap: dict[str, int] = {}
    in_tasks = False

    for row in rows:
        sec = is_section_row(row)
        if sec:
            emit_items(lines, section, items)
            items = []
            section = sec
            in_tasks = False
            continue

        joined = row_text(row)
        if "スプリントゴール" in joined:
            for c in row:
                t = norm(c)
                if t and "スプリントゴール" not in t and "このスプリント" not in t and len(t) > 25:
                    lines.extend(["", "## Sprint goal", "", md_block(t), ""])
                    break
            continue

        if "タスク" in joined and col_index(row, "PIC", "pic") is not None:
            cmap = build_map(row)
            in_tasks = True
            if not section or section == "Sprint planning":
                section = "Sprint backlog tasks"
            continue

        if not in_tasks:
            continue

        task = rel(row, cmap.get("task"))
        if not task or task.lower().startswith("pot"):
            continue
        if not re.search(r"\[|[A-Za-z\u3040-\u9fff]", task):
            continue

        tid = rel(row, cmap.get("id"))
        pid = rel(row, cmap.get("pid"))
        pic = rel(row, cmap.get("pic"))
        est = rel(row, cmap.get("estimate"))
        items.append(
            {
                "title": f"#{tid} {task.splitlines()[0][:70]}".strip(),
                "what": task,
                "assignee": pic,
                "estimate": f"{est} h" if est and re.match(r"^[\d.]+$", est) else est,
                "context": f"Product backlog P_ID: {pid}" if pid else "",
            }
        )

    emit_items(lines, section, items)
    return lines


def parse_product_backlog(rows: list[list[str]]) -> list[str]:
    lines = front_matter("Product Backlog", "csv/product_backlog.csv")
    items: list[dict[str, str]] = []
    cmap: dict[str, int] = {}

    for row in rows:
        if "p_id" in row_text(row).lower() or "プロダクトバックログ" in row_text(row):
            cmap = build_map(row)
            if "pid" not in cmap and len(row) > 1:
                cmap["pid"] = 1
            continue
        pid = rel(row, cmap.get("pid"))
        if not pid or not re.match(r"^\d", pid):
            continue
        feature = rel(row, cmap.get("feature"))
        if not feature:
            continue
        story = rel(row, cmap.get("story"))
        acceptance = rel(row, cmap.get("acceptance"))
        what = feature
        if story and story not in ("なし", "Không có"):
            what += f"\n\nUser story: {story}"
        items.append(
            {
                "title": f"P{pid} — {feature.splitlines()[0]}",
                "what": what,
                "criteria": acceptance,
                "priority": rel(row, cmap.get("priority")),
                "status": rel(row, cmap.get("status")),
            }
        )

    emit_items(lines, "Features to deliver", items)
    return lines


def is_checklist_header(row: list[str]) -> bool:
    has_no = any(norm(c).lower() in ("no.", "no") for c in row[:15])
    if not has_no:
        return False
    return any(
        k in c
        for c in row[:15]
        for k in ("確認項目", "確認すること", "すること", "観点", "Mục", "Todo", "todo", "Time", "時間")
    )


def parse_checklist(rows: list[list[str]], title: str, source: str) -> list[str]:
    lines = front_matter(title, source)
    section = "Checklist"
    items: list[dict[str, str]] = []
    cmap: dict[str, int] = {}
    ready = False
    dual_track = False

    def add_item(no: str, label: str, what: str, criteria: str, notes: str = "") -> None:
        if not what and not criteria:
            return
        w = what or criteria
        title_bit = (label or w).splitlines()[0][:80]
        items.append(
            {
                "title": f"{no}. {title_bit}" if no else title_bit,
                "what": w,
                "criteria": criteria if criteria and criteria != w else "",
                "notes": notes,
            }
        )

    for row in rows:
        sec = is_section_row(row)
        if sec:
            emit_items(lines, section, items)
            items = []
            section = sec
            continue

        if is_checklist_header(row):
            cmap = build_map(row)
            rt = row_text(row).lower()
            dual_track = (
                "開発t" in rt
                or "devt" in rt
                or sum(1 for c in row[:15] if norm(c).lower() in ("no.", "no")) >= 2
            )
            ready = True
            continue

        if not ready:
            continue

        base = first_data_col(row)
        no = rel(row, cmap.get("no")) or rel(row, base)
        if not no or not re.match(r"^\d", no.replace(".", "")):
            continue

        what = rel(row, cmap.get("what")) or rel(row, cmap.get("viewpoint"))
        criteria = rel(row, cmap.get("criteria"))
        label = rel(row, cmap.get("check_item")) or rel(row, cmap.get("sheet"))
        add_item(no, label, what, criteria)

        if dual_track:
            no2 = rel(row, 7)
            what2 = rel(row, 9)
            crit2 = rel(row, 10)
            if what2 and what2 != what and what2.upper() not in ("TRUE", "FALSE") and len(what2) > 12:
                add_item(no2, "", what2, crit2, "Dev team track")

    emit_items(lines, section, items)
    return lines


def parse_screen_design(rows: list[list[str]]) -> list[str]:
    lines = front_matter("Screen Design Document", "csv/screen_design_document.csv")
    section: str | None = None
    items: list[dict[str, str]] = []
    COL_NO, COL_NAME, COL_ACTION = 17, 18, 30

    for row in rows:
        if "画面ID" in row_text(row):
            emit_items(lines, section, items)
            items = []
            screen_id = rel(row, 3)
            screen_title = rel(row, 7)
            title_line = screen_title.splitlines()[0] if screen_title else f"Screen {screen_id}"
            section = f"Screen {screen_id}: {title_line}" if screen_id else title_line
            continue

        if "項目名称" in row_text(row):
            continue

        no = rel(row, COL_NO)
        name = rel(row, COL_NAME)
        action = rel(row, COL_ACTION)
        if not no or not re.match(r"^\d+\.0$", no) or not name:
            continue
        items.append(
            {
                "title": f"Item {no}: {name.splitlines()[0]}",
                "what": action or name,
                "notes": name if action else "",
            }
        )

    emit_items(lines, section, items)
    return lines


def parse_system_overview(rows: list[list[str]]) -> list[str]:
    lines = front_matter("System Overview", "csv/system_overview.csv")
    section = ""
    items: list[dict[str, str]] = []

    for row in rows:
        cells = nonempty(row)
        if not cells:
            continue
        lead = cells[0]

        if lead in OVERVIEW_SECTIONS:
            emit_items(lines, section, items)
            items = []
            if lead in ("1.問題", "2.想定ユーザー", "4.アプリ名称"):
                lines.extend(["", f"## {lead}", ""])
                if len(cells) > 1:
                    lines.append(md_block(" ".join(cells[1:])))
                    lines.append("")
                section = ""
            elif lead == "3.課題・解決策":
                section = "Problems and solutions — what to do"
            elif lead == "5.ロール一覧":
                section = "Roles"
            elif lead == "6.機能一覧":
                section = "Features — what to do"
            elif lead == "7.画面一覧":
                section = "Screens — what to implement"
            continue

        if section == "Features — what to do" and len(cells) >= 2 and re.match(r"^\d+\.0$", cells[0]):
            items.append(
                {
                    "title": f"Feature {cells[0]}: {cells[1].splitlines()[0]}",
                    "what": cells[1],
                    "notes": cells[-1] if len(cells) > 4 else "",
                }
            )
        elif section == "Screens — what to implement" and len(cells) >= 2 and re.match(r"^\d+\.0$", cells[0]):
            items.append({"title": f"Screen {cells[0]}: {cells[1].splitlines()[0]}", "what": cells[1]})
        elif section == "Problems and solutions — what to do" and len(cells) >= 2 and re.match(r"^\d+\.0$", cells[0]):
            items.append(
                {
                    "title": f"Issue {cells[0]}",
                    "what": cells[-1] if len(cells) > 2 else cells[0],
                    "context": cells[1] if len(cells) > 2 else "",
                }
            )

    emit_items(lines, section, items)
    return lines


def parse_screen_transitions(rows: list[list[str]]) -> list[str]:
    lines = front_matter("Screen Transition Diagram", "csv/screen_transition_diagram.csv")
    items: list[dict[str, str]] = []
    seen: set[str] = set()

    for row in rows:
        for c in row:
            t = norm(c)
            if not t or len(t) < 4 or t in seen:
                continue
            if any(k in t for k in ("画面", "Trang", "ログイン", "Đăng", "ホーム", "login", "đăng")):
                seen.add(t)
                items.append({"title": t.splitlines()[0], "what": t})

    emit_items(lines, "Navigation — what to do", items)
    return lines


def convert_file(csv_path: Path) -> tuple[Path, int]:
    stem = csv_path.stem
    title = TITLES.get(stem, stem.replace("_", " ").title())
    source = f"csv/{csv_path.name}"
    rows = load_csv(csv_path)

    if stem in ("sprint_backlog_1", "sprint_backlog_2"):
        lines = parse_sprint_backlog(rows, title)
        lines[2] = f"> Source: `{source}`"
    elif stem == "product_backlog":
        lines = parse_product_backlog(rows)
    elif stem == "screen_design_document":
        lines = parse_screen_design(rows)
    elif stem == "system_overview":
        lines = parse_system_overview(rows)
    elif stem == "screen_transition_diagram":
        lines = parse_screen_transitions(rows)
    elif "checklist" in stem:
        lines = parse_checklist(rows, title, source)
    else:
        lines = front_matter(title, source)

    out: list[str] = []
    for line in lines:
        if line == "" and out and out[-1] == "":
            continue
        out.append(line)

    md_path = MD_DIR / f"{stem}.md"
    md_path.write_text("\n".join(out).strip() + "\n", encoding="utf-8")
    count = "\n".join(out).count("**What to do:**")
    return md_path, count


def main() -> int:
    if not CSV_DIR.is_dir():
        print(f"Missing {CSV_DIR}", file=sys.stderr)
        return 1
    MD_DIR.mkdir(parents=True, exist_ok=True)

    manifest: list[str] = []
    for csv_path in sorted(CSV_DIR.glob("*.csv")):
        md_path, count = convert_file(csv_path)
        manifest.append(f"{csv_path.name}\t{md_path.name}\t{count}")
        print(f"{md_path.name} ({count} actions)")

    (MD_DIR / "_index.txt").write_text(
        "CSV\tMarkdown\taction_count\n" + "\n".join(manifest) + "\n",
        encoding="utf-8",
    )
    print(f"\nWrote {len(manifest)} files to {MD_DIR.resolve()}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
