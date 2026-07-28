# GridPool StartOS Package

This is a thin StartOS wrapper around pinned `boot-protocol` and
`gridpool-sv2-pool` images.

- Do not implement consensus rules in this repository.
- Preserve the `main` volume and include it in backup/restore.
- Use the generic `bitcoind` dependency interfaces so Core and Knots remain
  interchangeable.
- RPC/ZMQ and the WebUI remain private; expose only declared StartOS interfaces.
- Native SV2 is the only promised miner transport for the initial beta.
