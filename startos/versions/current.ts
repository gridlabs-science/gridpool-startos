import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.2.2:5',
  releaseNotes: {
    en_US:
      'Updates the runtime, advertises SV2 connection details, adds opt-in trusted private diagnostics, and preserves unreadable identity files for recovery.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
}).satisfies('0.1.0:17')
