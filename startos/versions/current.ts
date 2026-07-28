import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.1.0:6',
  releaseNotes: {
    en_US:
      'Adds GridPool network, Bitcoin, relay, and pulse telemetry to the StartOS health dashboard.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
