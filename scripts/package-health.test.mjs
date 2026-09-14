import assert from 'node:assert/strict'
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { runInNewContext } from 'node:vm'
import { test } from 'node:test'

// Execute the actual shell snippets shipped in the package with a fake curl.
const source = readFileSync(new URL('../startos/main.ts', import.meta.url), 'utf8')
const scripts = [...source.matchAll(/(\[\s*'set -eu',[\s\S]*?\])\.join\('; '\)/g)]
  .map((match) => runInNewContext(match[1]).join('; '))

test('both summary health scripts fail closed when HTTP fails', () => {
  assert.equal(scripts.length, 2)
  const dir = mkdtempSync(join(tmpdir(), 'gridpool-health-'))
  try {
    writeFileSync(join(dir, 'curl'), '#!/bin/sh\nexit 22\n', { mode: 0o700 })
    for (const script of scripts) {
      const result = spawnSync('sh', ['-c', script], { env: { ...process.env, PATH: `${dir}:${process.env.PATH}` } })
      assert.equal(result.status, 22)
      assert.equal(result.stdout.toString(), '')
    }
  } finally { rmSync(dir, { recursive: true, force: true }) }
})

test('network and pulse fields survive multiline JSON', () => {
  const dir = mkdtempSync(join(tmpdir(), 'gridpool-health-'))
  try {
    writeFileSync(join(dir, 'curl'), '#!/bin/sh\nprintf "%s" "$FIXTURE"\n', { mode: 0o700 })
    const env = { ...process.env, PATH: `${dir}:${process.env.PATH}`, FIXTURE: JSON.stringify({
      peerCount: 5, currentTipBlockHeight: 961000, localMiningSourceCount: 1,
      localMiningHashrateDisplay: '1 TH/s', bitcoinNotification: { rpc: { reachable: true, synced: true } },
      localPulseAcceptedCount: 3, lastLocalPulseUtc: '2026-09-13T00:00:00Z',
      lastSuccessfulOutboundRelayUtc: '2026-09-13T00:00:01Z', outboundRelayHealthy: true,
      pulseProofsEnabled: true,
    }, null, 2) }
    const network = spawnSync('sh', ['-c', scripts[0]], { env, encoding: 'utf8' })
    assert.equal(network.status, 0)
    assert.match(network.stdout, /peers=5; tip=961000; local sources=1; hashrate=1 TH\/s; Bitcoin RPC reachable=true synced=true/)
    const relay = spawnSync('sh', ['-c', scripts[1]], { env, encoding: 'utf8' })
    assert.equal(relay.status, 0)
    assert.match(relay.stdout, /accepted=3; last pulse=2026/)
  } finally { rmSync(dir, { recursive: true, force: true }) }
})
