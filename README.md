# GridPool for StartOS

StartOS package for the GridPool reference node and canonical native Stratum V2
server. It consumes the installed `bitcoind` dependency through its RPC/ZMQ
interfaces. Bitcoin Core and Bitcoin Knots packages that implement that
dependency contract are supported; Core IPC is not required across the package
boundary.

This repository is an early sideload beta. Build and install it only on a test
server, and back up the GridPool volume before upgrades.

## Build

```bash
npm ci
make x86
# or: make arm
```

Install the resulting `.s9pk` through StartOS System > Sideload Service. Set a
mainnet payout address with **Actions > Configure GridPool**, select the
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
