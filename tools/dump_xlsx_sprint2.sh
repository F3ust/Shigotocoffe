#!/usr/bin/env bash
set -euo pipefail
WORKDIR=/tmp/xspec
rm -rf "$WORKDIR"
mkdir -p "$WORKDIR"
unzip -q -o "/mnt/d/仕事コーヒー/ミシ_システム仕様書（トラム）.xlsx" -d "$WORKDIR"
echo "=== workbook sheets ==="
sed 's/></>\n</g' "$WORKDIR/xl/workbook.xml" | grep -E 'sheet ' | head -40
echo "=== grep sprint / スプリント in sharedStrings (sample) ==="
if [[ -f "$WORKDIR/xl/sharedStrings.xml" ]]; then
  grep -n -i 'sprint\|スプリント' "$WORKDIR/xl/sharedStrings.xml" | head -40 || true
fi
echo "=== grep in all sheet xml ==="
grep -l -i 'sprint\|スプリント\|Sprint' "$WORKDIR/xl/worksheets/"*.xml 2>/dev/null || true
for f in "$WORKDIR/xl/worksheets/"sheet*.xml; do
  if grep -qi 'sprint.*2\|スプリント.*2\|Sprint 2\|Sprint2' "$f" 2>/dev/null; then
    echo "--- HIT: $f ---"
    grep -o '<v>[^<]*</v>' "$f" 2>/dev/null | head -5 || true
    grep -o '<t[^>]*>[^<]*</t>' "$f" 2>/dev/null | head -20 || true
  fi
done
