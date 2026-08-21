import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.1.0:19',
  releaseNotes: {
    en_US:
      'Exports the authenticated UDP relay and adds release-candidate lifecycle and supply-chain checks.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
}).satisfies('0.1.0:17')
