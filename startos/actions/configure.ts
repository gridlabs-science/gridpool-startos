import { settingsJson } from '../fileModels/settings.json'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

export const configure = sdk.Action.withInput(
  'configure',
  async () => ({
    name: 'Configure GridPool',
    description: 'Set the fallback and operator payout address.',
    warning: null,
    allowedStatuses: 'any',
    group: 'Configuration',
    visibility: 'enabled',
  }),
  InputSpec.of({
    payoutAddress: Value.text({
      name: 'Mainnet payout address',
      description:
        'Used for slot 0 when an SV2 channel supplies only a worker label.',
      default: null,
      required: true,
      placeholder: 'bc1q...',
    }),
  }),
  async () => (await settingsJson.read().once()) ?? { payoutAddress: '' },
  async ({ effects, input }) => {
    if (!/^(bc1|1|3)[A-Za-z0-9]{20,90}$/.test(input.payoutAddress)) {
      throw new Error('Enter a valid-looking mainnet Bitcoin address')
    }
    await settingsJson.write(effects, input)
    await sdk.restart(effects)
  },
)
