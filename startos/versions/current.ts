import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.1.0:9',
  releaseNotes: {
    en_US:
      'Fixes SegWit SV2 pulse validation and reports attached Bitcoin RPC health correctly.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
