import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.1.0:4',
  releaseNotes: {
    en_US:
      'Initial sideload beta with native SV2 and Bitcoin Core/Knots RPC support.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
