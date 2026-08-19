import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.1.0:17',
  releaseNotes: {
    en_US:
      'Preserves GridPool node identity across package regeneration and adds release-candidate lifecycle checks.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
}).satisfies('0.1.0:16')
