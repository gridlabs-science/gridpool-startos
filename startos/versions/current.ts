import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.1.0:10',
  releaseNotes: {
    en_US:
      'Acknowledges native SV2 shares immediately to prevent replayed batches across GridPool work refreshes.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
