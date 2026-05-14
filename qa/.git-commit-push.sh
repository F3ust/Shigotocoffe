#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
git add qa/
git status --short
git commit -m "docs(qa): English-only QA docs and scripts"
git push origin feature/sprint-1-qa-completion
