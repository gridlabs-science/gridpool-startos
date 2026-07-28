import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.1.0:5',
  releaseNotes: {
    en_US:
      'Fixes native SV2 startup with attached Bitcoin Core/Knots RPC and preserves the existing state volume.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
