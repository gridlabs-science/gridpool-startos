# GridPool for StartOS

StartOS package for the GridPool reference node and canonical native Stratum V2
server. It consumes the installed `bitcoind` dependency through its RPC/ZMQ
interfaces. Bitcoin Core and Bitcoin Knots packages that implement that
dependency contract are supported; Core IPC is not required across the package
boundary.

This repository is an early sideload beta. Build and install it only on a test
server, and back up the GridPool volume before upgrades.

Runtime images are pinned by immutable OCI digest. Release artifacts are built
for x86_64 and aarch64 by GitHub Actions and include SHA-256 checksums plus
provenance attestations.

## Build

```bash
sudo apt install squashfs-tools squashfs-tools-ng
curl -fsSL https://start9.com/start-cli/install.sh | sh
cd ..
start-cli s9pk init-workspace
cd gridpool-startos
npm ci
make x86
# or: make arm
```

Building and signing the package are local operations and do not require a
StartOS login. The host is needed only for CLI installation. Set `host.default`
in the workspace `.startos/config.yaml` to the server origin, without a path:

```yaml
host:
  default: https://your-startos-host.local
```

Authenticate once with `start-cli auth login` before using CLI install
commands. Do not append `/login` to the hostname; that is a browser route and
causes CLI RPC requests to fail with `Method Not Allowed`.

Install the resulting `gridpool_<arch>.s9pk` through StartOS **System >
Sideload Service**, or run:

```bash
start-cli auth login
start-cli package install --sideload gridpool_x86_64.s9pk
```

Set a mainnet payout address with **Actions > Configure GridPool**, select the
installed Bitcoin dependency, and start GridPool after Bitcoin is synchronized.

Native SV2 miners connect to the service's **Native Stratum V2** interface on
port `34265`. A miner may use a valid payout address as its channel identity;
worker labels use the package fallback address.

## Scope

- GridPool WebUI/API is a private StartOS UI interface.
- Native SV2 is the sole miner-facing transport in the initial appliance beta.
- The Bitcoin dependency supplies RPC, ZMQ, and its read-only RPC cookie.
- GridPool identity/state, SV2 keys, adapter token, and proof spool are included
  in StartOS backups.
- DATUM and raw Stratum V1 are intentionally not packaged.
- The appliance exports native SV2 TCP and authenticated GridPool UDP relay.
  Bitcoin RPC/ZMQ, adapter APIs, SV2 monitoring, and the UI backend remain
  private package interfaces.

## Backup, upgrade, and recovery

The StartOS `main` volume is the complete GridPool appliance backup unit. It
contains the payout setting, GridPool identity and consensus state, native-SV2
authority keys, adapter token, and durable proof spool. Bitcoin chain data is
owned by the Bitcoin dependency and is not duplicated.

Before every sideload upgrade:

1. Create a StartOS backup containing GridPool and verify that the backup is
   listed on the configured target.
2. Record the GridPool node-ID fingerprint and installed package version.
3. Sideload the new package over the existing installation; do not uninstall
   first.
4. Confirm the node ID, payout setting, Bitcoin authority, and SV2 health after
   startup.

For disaster recovery, install the same or a compatible package version and use
StartOS **Restore From Backup**. A successful restore must preserve the node ID
and SV2 authority. Never resolve a state mismatch by deleting the `main` volume.

A normal uninstall deletes service data. Use a verified encrypted backup first;
`start-cli package uninstall --soft gridpool` is reserved for controlled package
lifecycle testing where preserving the volume is intentional.

## Release verification

```bash
npm ci
npm run check
npm run build
./scripts/verify-release-inputs.sh
./scripts/audit-build-dependencies.sh
```

Start SDK 2.0.9 currently bundles high-severity parser advisories in its ESLint
build-tool subtree. The audit script permits only those exact non-runtime paths
and verifies they do not enter the generated procedure bundle. Any runtime or
unrelated high/critical advisory fails CI.

StartOS cross-architecture packing cannot currently consume a multi-arch image
by index-digest reference. The manifest therefore uses commit-addressed `sha-*`
tags, while `release-images.json` locks their OCI index digests and the release
build verifies each tag still resolves to the expected digest before packing.
