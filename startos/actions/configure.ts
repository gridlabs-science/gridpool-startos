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
    minerHost: Value.text({
      name: 'Miner-reachable host (optional)',
      description: 'LAN IP or hostname of this StartOS server, without a scheme or port. Use the Native Stratum V2 interface address, not a Tor or UI-proxy hostname.',
      default: null,
      required: false,
      placeholder: '192.168.1.223',
    }),
    trustedPrivateDashboard: Value.toggle({
      name: 'Trust dashboard visitors',
      description: 'Show read-only operator details without a separate password. Enable only if every visitor to the service UI is trusted; this can expose local client and peer details. Does not enable administrative mutation APIs.',
      default: false,
    }),
    payoutAddress: Value.text({
      name: 'Mainnet payout address',
      description:
        'Used for slot 0 when an SV2 channel supplies only a worker label.',
      default: null,
      required: true,
      placeholder: 'bc1q...',
    }),
  }),
  async () => (await settingsJson.read().once()) ?? { payoutAddress: '', minerHost: '', trustedPrivateDashboard: false },
  async ({ effects, input }) => {
    if (!/^(bc1|1|3)[A-Za-z0-9]{20,90}$/.test(input.payoutAddress)) {
      throw new Error('Enter a valid-looking mainnet Bitcoin address')
    }
    const minerHost = (input.minerHost ?? '').trim()
    if (minerHost && !/^[A-Za-z0-9.-]+$/.test(minerHost)) {
      throw new Error('Use a LAN hostname or IPv4 address without a scheme, port, or path')
    }
    await settingsJson.write(effects, { ...input, minerHost })
    await sdk.restart(effects)
  },
)
