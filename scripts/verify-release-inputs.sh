#!/usr/bin/env bash
set -euo pipefail

manifest="startos/manifest/index.ts"
lock="release-images.json"

for component in gridpool sv2; do
  reference="$(jq -r --arg component "$component" '.[$component].reference' "$lock")"
  expected="$(jq -r --arg component "$component" '.[$component].indexDigest' "$lock")"
  grep -Fq "$reference" "$manifest"
  [[ "$reference" =~ :sha-[0-9a-f]{7,40}$ ]]
  [[ "$expected" =~ ^sha256:[0-9a-f]{64}$ ]]
  if command -v docker >/dev/null && docker buildx version >/dev/null 2>&1; then
    actual="$(docker buildx imagetools inspect "$reference" --format '{{json .Manifest}}' | jq -r '.digest // .Digest')"
    [[ "$actual" == "$expected" ]] || {
      echo "$component image digest mismatch: expected $expected, got $actual" >&2
      exit 1
    }
    inspection="$(docker buildx imagetools inspect "$reference")"
    grep -q 'linux/amd64' <<<"$inspection"
    grep -q 'linux/arm64' <<<"$inspection"
  fi
done

! git ls-files '*.s9pk' '*.s9pk.sha256' | grep -q .
grep -q "ed25519_private_key.*x25519_private_key\|x25519_private_key.*ed25519_private_key" startos/main.ts || \
  grep -q "\['ed25519_private_key', 'x25519_private_key'\]" startos/main.ts
grep -q "GridPool UDP Relay" startos/interfaces.ts
grep -q "preferredExternalPort: udpRelayPort" startos/interfaces.ts
! grep -Eq 'preferredExternalPort: (8332|28332|28333|34290|5000)' startos/interfaces.ts
grep -q '^[[:space:]]*bootConfigPath,$' startos/main.ts
grep -A4 '^[[:space:]]*bootConfigPath,$' startos/main.ts | grep -q "mode: 0o600"
grep -q "writeFile(tokenPath.*mode: 0o600" startos/main.ts
echo "release image tags resolve to locked OCI digests and package artifacts are untracked"
