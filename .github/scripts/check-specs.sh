#!/usr/bin/env bash
set -euo pipefail

BASE=${1:-}
HEAD=${2:-}
SPEC_EXCEPTION=${3:-false}

if [ -z "$BASE" ] || [ -z "$HEAD" ]; then
  echo "Usage: check-specs.sh <base-sha> <head-sha> [spec-exception]"
  exit 2
fi

echo "Checking changes between $BASE and $HEAD"
CHANGED_FILES=$(git diff --name-only "$BASE" "$HEAD")

echo "Changed files:\n$CHANGED_FILES"

# Patterns that indicate code/API changes which require spec/docs updates
CODE_PATTERNS=("^app/" "^src/" "^app/repositories/" "^app/stores/" "^src/index.ts")

NEEDS_SPECS=false
for p in "${CODE_PATTERNS[@]}"; do
  if echo "$CHANGED_FILES" | grep -E "$p" >/dev/null; then
    NEEDS_SPECS=true
    break
  fi
done

if [ "$NEEDS_SPECS" = true ]; then
  # Check if any specs/docs/tasks/CHANGELOG updated
  if echo "$CHANGED_FILES" | grep -E "^\.agent/specs/|^\.agent/docs/|^CHANGELOG.md|^\.agent/docs/tasks/" >/dev/null; then
    echo "Specs/docs/tasks/CHANGELOG updated alongside code changes — OK"
    exit 0
  fi

  if [ "$SPEC_EXCEPTION" = "true" ]; then
    echo "Spec exception label present, allow proceeding but ensure QA entry was added."
    exit 0
  fi

  echo "ERROR: Code/API changes detected but no .agent/specs, .agent/docs, .agent/docs/tasks, or CHANGELOG.md changes found."
  echo "Please update the relevant spec/docs/tasks in this PR or add 'spec-exception' label with justification and QA entry."
  exit 1
else
  echo "No code/API changes detected that require spec updates."
  exit 0
fi
