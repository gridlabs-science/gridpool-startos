import {
  rpcHostId,
  rpcPort,
  zmqHostId,
  zmqPortBlock,
} from 'bitcoin-core-startos/startos/utils'
import { randomBytes } from 'node:crypto'
import {
  chmod,
  mkdir,
  readFile,
  writeFile,
} from 'node:fs/promises'
import { settingsJson } from './fileModels/settings.json'
import { sdk } from './sdk'
import { bitcoinMount, sv2Port, uiPort } from './utils'

const volumeRoot = '/media/startos/volumes/main'

const mounts = sdk.Mounts.of()
  .mountVolume({
    volumeId: 'main',
    subpath: null,
    mountpoint: '/data',
    readonly: false,
  })
  .mountDependency({
    dependencyId: 'bitcoind',
    volumeId: 'main',
    mountpoint: bitcoinMount,
    subpath: null,
    readonly: true,
    // Bitcoin's cookie is root-owned and mode 0600 on the dependency
    // volume. Present root-owned files as UID 1000 so the GridPool image's
    // unprivileged `boot` process can authenticate without changing the
    // Bitcoin volume permissions.
    idmap: [{ fromId: 0, toId: 1000 }],
  })

export const main = sdk.setupMain(async ({ effects }) => {
  const settings = await settingsJson.read().const(effects)
  if (!settings?.payoutAddress) {
    throw new Error('Run Actions > Configure GridPool before starting')
  }

  const rpcUrl = await sdk.host
    .getBridgeAddress(effects, {
      packageId: 'bitcoind',
      hostId: rpcHostId,
      internalPort: rpcPort,
      ssl: false,
    })
    .const()
  const zmqBlock = await sdk.host
    .getBridgeAddress(effects, {
      packageId: 'bitcoind',
      hostId: zmqHostId,
      internalPort: zmqPortBlock,
    })
    .const()

  if (!rpcUrl || !zmqBlock) {
    throw new Error('Bitcoin RPC/ZMQ dependency interfaces are unavailable')
  }
  const rpcHttpUrl = rpcUrl.includes('://') ? rpcUrl : `http://${rpcUrl}`

  await mkdir(`${volumeRoot}/gridpool`, { recursive: true })
  await mkdir(`${volumeRoot}/sv2/proof-spool`, { recursive: true })
  await mkdir(`${volumeRoot}/shared`, { recursive: true })

  const tokenPath = `${volumeRoot}/shared/local-adapter.token`
  try {
    await readFile(tokenPath)
  } catch {
    await writeFile(tokenPath, randomBytes(32).toString('hex'), { mode: 0o600 })
  }

  const authorityPath = `${volumeRoot}/sv2/authority.env`
  let authority = await readFile(authorityPath, 'utf8').catch(() => '')
  if (!authority) {
    authority = await sdk.SubContainer.withTemp(
      effects,
      { imageId: 'sv2' },
      mounts,
      'gridpool-keygen-sub',
      async (subcontainer) => {
        const result = await subcontainer.exec([
          '/app/pool_sv2',
          '--generate-authority-keypair',
        ])
        if (result.exitCode !== 0) {
          throw new Error('Failed to generate the SV2 authority keypair')
        }
        return result.stdout.toString()
      },
    )
    await writeFile(authorityPath, authority, { mode: 0o600 })
  }

  const authorityValues = Object.fromEntries(
    authority
      .trim()
      .split('\n')
      .map((line) => line.split('=', 2)),
  )
  const authorityPublic = authorityValues.authority_public_key
  const authoritySecret = authorityValues.authority_secret_key
  if (!authorityPublic || !authoritySecret) {
    throw new Error('Stored SV2 authority keypair is malformed')
  }

  const bootConfig = {
    bitcoin_notification_mode: 'attached-node',
    NotificationSource: 'BitcoinZmq',
    bitcoin_rpc_url: rpcHttpUrl,
    bitcoin_rpc_cookie_file: `${bitcoinMount}/.cookie`,
    bitcoin_rpc_poll_interval_seconds: 5,
    bitcoin_zmq_endpoint: '',
    bitcoin_zmq_rawblock_endpoint: `tcp://${zmqBlock}`,
    bitcoin_network: 'mainnet',
    boot_network_id: 'mainnet-beta',
    boot_protocol_version: 22,
    v22_activation_block_height: 959500,
    node_mode: 'development',
    public_base_url: '',
    enable_peer_sync: true,
    bootstrap_peers: ['https://main.gridpool.net'],
    enable_peer_udp_fast_relay: true,
    peer_udp_bind_port: 5001,
    peer_udp_port: 5001,
    peer_udp_public_host: '',
    enable_pulse_proofs: true,
    pool_payout_script: settings.payoutAddress,
    winners_list_size: 299,
    grid_labs_support_fee_enabled: true,
    work_set_reserve_multiplier: 3,
    local_adapter_token_file: '/data/shared/local-adapter.token',
    local_sv2_api_url: 'http://127.0.0.1:34290/api/v1/global',
    enable_admin_api: false,
  }
  await writeFile(
    `${volumeRoot}/gridpool/boot_portal_config.json`,
    `${JSON.stringify(bootConfig, null, 2)}\n`,
    { mode: 0o600 },
  )

  const sv2Config = `authority_public_key = "${authorityPublic}"
authority_secret_key = "${authoritySecret}"
cert_validity_sec = 3600
listen_address = "0.0.0.0:34265"
coinbase_reward_script = "addr(${settings.payoutAddress})"
server_id = 1
pool_signature = "GridPool StartOS Native SV2"
shares_per_minute = 6.0
share_batch_size = 10
monitoring_address = "127.0.0.1:34290"
monitoring_cache_refresh_secs = 15

[gridpool]
node_url = "http://127.0.0.1:5000"
fallback_payout_address = "${settings.payoutAddress}"
operator_fee_percent = 0.0
adapter_token_file = "/data/shared/local-adapter.token"
proof_spool_dir = "/data/sv2/proof-spool"
refresh_seconds = 10
telemetry_flush_seconds = 5
fee_cycle_seconds = 1500

[template_provider_type.BitcoinJsonRpc]
url = "${rpcHttpUrl}"
cookie_file = "${bitcoinMount}/.cookie"
timeout_seconds = 90
retry_seconds = 2
min_interval = 5
`
  await writeFile(`${volumeRoot}/sv2/pool-config.toml`, sv2Config, {
    mode: 0o600,
  })
  await chmod(tokenPath, 0o600)
  await chmod(authorityPath, 0o600)

  const gridpoolSub = sdk.SubContainer.of(
    effects,
    { imageId: 'gridpool' },
    mounts,
    'gridpool-node-sub',
  )
  const sv2Sub = sdk.SubContainer.of(
    effects,
    { imageId: 'sv2' },
    mounts,
    'gridpool-sv2-sub',
  )

  return sdk.Daemons.of(effects)
    .addOneshot('prepare-volume', {
      subcontainer: gridpoolSub,
      exec: {
        command: [
          'chown',
          '-R',
          '1000:1000',
          '/data/gridpool',
          '/data/shared',
        ],
        user: 'root',
      },
      requires: [],
    })
    .addDaemon('gridpool', {
      subcontainer: gridpoolSub,
      exec: {
        command: ['dotnet', 'boot_portal.dll'],
        env: {
          BOOT_PORTAL_CONFIG_PATH: '/data/gridpool/boot_portal_config.json',
          BOOT_PORTAL_STATE_PATH: '/data/gridpool/pool_state.json',
        },
      },
      ready: {
        display: 'GridPool Web UI',
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, uiPort, {
            successMessage: 'GridPool is ready',
            errorMessage: 'GridPool is not ready',
          }),
      },
      requires: ['prepare-volume'],
    })
    .addHealthCheck('gridpool-network', {
      ready: {
        display: 'GridPool Network',
        fn: () =>
          sdk.healthCheck.runHealthScript(
            [
              'sh',
              '-c',
              [
                'json=$(curl -fsS --max-time 5 http://127.0.0.1:5000/api/network/summary)',
                'peers=$(printf "%s" "$json" | sed -n \'s/.*"peerCount"[[:space:]]*:[[:space:]]*\([0-9][0-9]*\).*/\\1/p\')',
                'tip=$(printf "%s" "$json" | sed -n \'s/.*"currentTipBlockHeight"[[:space:]]*:[[:space:]]*\([0-9][0-9]*\).*/\\1/p\')',
                'sources=$(printf "%s" "$json" | sed -n \'s/.*"localMiningSourceCount"[[:space:]]*:[[:space:]]*\([0-9][0-9]*\).*/\\1/p\')',
                'hashrate=$(printf "%s" "$json" | sed -n \'s/.*"localMiningHashrateDisplay"[[:space:]]*:[[:space:]]*"\\([^"\\]*\\)".*/\\1/p\')',
                'rpc=$(printf "%s" "$json" | sed -n \'s/.*"rpcReachable"[[:space:]]*:[[:space:]]*\\([^,}]*\\).*/\\1/p\')',
                'synced=$(printf "%s" "$json" | sed -n \'s/.*"rpcSynced"[[:space:]]*:[[:space:]]*\\([^,}]*\\).*/\\1/p\')',
                'printf "peers=%s; tip=%s; local sources=%s; hashrate=%s; Bitcoin RPC reachable=%s synced=%s\\n" "${peers:-0}" "${tip:---}" "${sources:-0}" "${hashrate:---}" "${rpc:-unknown}" "${synced:-unknown}"',
              ].join('; '),
            ],
            gridpoolSub,
            {
              errorMessage: 'GridPool summary endpoint is unavailable',
              message: (result) => result.trim(),
            },
          ),
      },
      requires: ['gridpool'],
    })
    .addHealthCheck('gridpool-relay', {
      ready: {
        display: 'GridPool Relay and Pulse',
        fn: () =>
          sdk.healthCheck.runHealthScript(
            [
              'sh',
              '-c',
              [
                'json=$(curl -fsS --max-time 5 http://127.0.0.1:5000/api/network/summary)',
                'pulses=$(printf "%s" "$json" | sed -n \'s/.*"localPulseAcceptedCount"[[:space:]]*:[[:space:]]*\([0-9][0-9]*\).*/\\1/p\')',
                'lastPulse=$(printf "%s" "$json" | sed -n \'s/.*"lastLocalPulseUtc"[[:space:]]*:[[:space:]]*"\\([^"\\]*\\)".*/\\1/p\')',
                'lastRelay=$(printf "%s" "$json" | sed -n \'s/.*"lastSuccessfulOutboundRelayUtc"[[:space:]]*:[[:space:]]*"\\([^"\\]*\\)".*/\\1/p\')',
                'healthy=$(printf "%s" "$json" | sed -n \'s/.*"outboundRelayHealthy"[[:space:]]*:[[:space:]]*\\([^,}]*\\).*/\\1/p\')',
                'enabled=$(printf "%s" "$json" | sed -n \'s/.*"pulseProofsEnabled"[[:space:]]*:[[:space:]]*\\([^,}]*\\).*/\\1/p\')',
                'printf "pulse proofs enabled=%s; accepted=%s; last pulse=%s; last outbound relay=%s; relay healthy=%s\\n" "${enabled:-unknown}" "${pulses:-0}" "${lastPulse:---}" "${lastRelay:---}" "${healthy:-unknown}"',
              ].join('; '),
            ],
            gridpoolSub,
            {
              errorMessage: 'GridPool relay telemetry is unavailable',
              message: (result) => {
                const message = result.trim()
                return message.includes('accepted=0')
                  ? `${message} (no pulse traffic yet; this is normal when idle)`
                  : message
              },
            },
          ),
      },
      requires: ['gridpool'],
    })
    .addDaemon('sv2', {
      subcontainer: sv2Sub,
      exec: {
        command: [
          '/app/pool_sv2',
          '--config',
          '/data/sv2/pool-config.toml',
        ],
      },
      ready: {
        display: 'Native Stratum V2',
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, sv2Port, {
            successMessage: 'Native SV2 is ready',
            errorMessage: 'Native SV2 is not ready',
          }),
      },
      requires: ['gridpool'],
    })
})
