import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.1.0:11',
  releaseNotes: {
    en_US:
      'Makes RPC-generated SV2 jobs unique so firmware cannot replay completed work across template refreshes.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
