# GridPool

1. Wait for Bitcoin Core or Bitcoin Knots to finish synchronizing.
2. Open **Actions > Configure GridPool** and enter a mainnet payout address.
3. Start GridPool.
4. Open **Actions > Connect a native SV2 miner** for the public Noise authority
   key and instructions. Use the host and external port of the **Native
   Stratum V2** interface, not the Web UI or Tor address. Preferred port: 34265.
5. Select native SV2 Standard/Noise on the ASIC, paste the public authority key,
   and use a worker label (such as `miner`) to use your configured payout address.
   Check accepted shares, not just a connected socket, before filming a demo.

In **Configure GridPool**, optionally set a miner-reachable LAN hostname/IP so
the dashboard's connection card does not infer it from a browser proxy address.
Setup is a StartOS action and restarts the service after saving; there is no
separate web setup form or web redirect to wait for.

For a trusted private installation, enable **Trust dashboard visitors** in that
action to remove the separate operator unlock and show read-only local details.
Leave it off if untrusted users can reach the service UI. This setting is not
authentication and does not enable administrative mutation APIs.

GridPool is non-custodial. Backups preserve node identity, consensus state,
native SV2 authority keys, and queued proofs.
