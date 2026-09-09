#!/usr/bin/env bash
set -euo pipefail

report="${1:-npm-audit.json}"
npm audit --omit=dev --json > "$report" || true

# Start SDK 2.0.9 bundles these parsers for its own build tooling. Permit only
# findings inside that subtree and verify they never enter packaged procedures.
jq -e '
  [
    .vulnerabilities
    | to_entries[]
    | select(.value.severity == "high" or .value.severity == "critical")
    | .value.nodes[]
    | select(startswith("node_modules/@start9labs/start-sdk/node_modules/") | not)
  ] | length == 0
' "$report" >/dev/null

if [[ -d javascript ]] && rg -q 'brace-expansion|js-yaml|YAMLException' javascript; then
  echo "vulnerable Start SDK build-only parser entered the packaged procedure bundle" >&2
  exit 1
fi

echo "Dependency audit contains only documented Start SDK 2.0.9 build-tool advisories."
