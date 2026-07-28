import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

export const settingsJson = FileHelper.json(
  { base: sdk.volumes.main, subpath: '/settings.json' },
  z.object({
    payoutAddress: z.string().catch(''),
  }),
)
