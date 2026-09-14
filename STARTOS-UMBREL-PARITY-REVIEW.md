# StartOS / Umbrel parity review

Candidate: 0.1.0:20. Source review and local checks are not an appliance test.

## Applicable changes

- Runtime advanced from 9ac862a to be0f0b1, with its verified multi-architecture
  OCI index pinned in release-images.json. This includes the Umbrel-era runtime
  bootstrap and dashboard changes; it does not deploy any running node.
- Native SV2 enablement, port, public authority key, and optional LAN host are
  now supplied to the dashboard. A StartOS action exposes connection guidance
  independently of dashboard availability, without revealing the secret key.
- Private diagnostic access is explicitly opt-in. A service interface marked
  private is not sufficient evidence that every browser visitor is trusted.
- Unreadable persisted identity/token/authority files no longer silently trigger
  replacement on permission errors. The main volume backup still covers them.
- Health scripts now fail when curl fails, instead of returning success after
  a pipeline error. A recorded pulse/relay timestamp no longer gets the
  misleading idle suffix just because the accepted counter is zero.

## Not applicable

StartOS uses Actions > Configure GridPool and sdk.restart, not Umbrel's init
container or Razor setup redirect. Umbrel's preserved template migration is not
part of this package. Existing settings obtain safe defaults for new fields.

## Outstanding release gates

- Real StartOS install/upgrade/restart and miner accepted-share verification
  remain untested for this candidate because the test appliance failed.
- Test interface address/port assignment on LAN and ensure it matches the miner
  connection card. Browser proxy/Tor hostnames must not be used for the ASIC.
- Test backup/restore with persistent node ID and SV2 authority unchanged.
- Configure's address check is only a syntax screen; runtime validation remains
  authoritative. Include a bad-checksum address in appliance acceptance and
  verify no mining work is issued.
- The pinned SV2 image still has the previously reported PCRE2 vulnerability
  scan findings. Rebuild/scan it before claiming supply-chain gates passed.
- Health scripts still parse selected fields using sed. Missing fields mean
  unavailable telemetry, not proof of node health; replace this with typed JSON
  parsing in a future package/runtime health contract.

Do not distribute old .s9pk files left from earlier builds as this candidate.
Rebuild/checksum artifacts after review. No stable-release claim is made.

## Local validation

Passed: TypeScript check, ncc package JavaScript build, two executable shell
health regression tests (HTTP failure and multiline JSON), image digest and
architecture verification, and git whitespace checks. Dependency auditing
returned only the previously documented Start SDK build-tool advisories; this
is not a claim of zero advisories. No new .s9pk was built or deployed in this pass.
