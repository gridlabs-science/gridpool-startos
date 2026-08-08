import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.1.0:15',
  releaseNotes: {
    en_US:
      'Isolates and coalesces dashboard reads so the Web UI cannot exhaust public API rate limits.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
