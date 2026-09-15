import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.2.2:6',
  releaseNotes: {
    en_US:
      'Introduces the refined GridPool triangle icon with an asymmetric ranked-work curve. Runtime images, mining behavior, and persistent data are unchanged from beta.6.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
}).satisfies('0.1.0:17')
