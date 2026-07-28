import { autoconfig } from 'bitcoin-core-startos/startos/actions/config/autoconfig'
import { sdk } from './sdk'

export const setDependencies = sdk.setupDependencies(async ({ effects }) => {
  await sdk.action.createTask(effects, 'bitcoind', autoconfig, 'critical', {
    input: {
      kind: 'partial',
      accept: [{ zmqEnabled: true }],
      set: { zmqEnabled: true },
    },
    reason: 'GridPool uses Bitcoin ZMQ for prompt local tip notifications.',
    when: { condition: 'input-not-matches', once: false },
  })

  return {
    bitcoind: {
      kind: 'running',
      versionRange: '>=28.0:0',
      healthChecks: ['bitcoind', 'sync-progress'],
    },
  }
})
