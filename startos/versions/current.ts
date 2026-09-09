import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.2.2:4',
  releaseNotes: {
    en_US:
      'Early beta with V2.2 security hardening, native SV2 mining, authenticated UDP relay, and reproducible release artifacts.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
}).satisfies('0.1.0:17')
