import { readFile } from 'node:fs/promises'
import { settingsJson } from '../fileModels/settings.json'
import { sdk } from '../sdk'

export const connect = sdk.Action.withoutInput(
  'connect-miner',
  async () => ({
    name: 'Connect a native SV2 miner',
    description: 'Show the mining port and public Noise authority key. No private keys are displayed.',
    warning: null,
    allowedStatuses: 'any',
    group: 'Mining',
    visibility: 'enabled',
  }),
  async () => {
    const settings = await settingsJson.read().once()
    const authority = await readFile('/media/startos/volumes/main/sv2/authority.env', 'utf8')
      .catch((error: NodeJS.ErrnoException) => {
        if (error.code === 'ENOENT') return ''
        throw new Error('Unable to read the saved SV2 authority')
      })
    const publicKey = authority.match(/^authority_public_key=([^\r\n]+)$/m)?.[1]
    return {
      version: '1' as const,
      title: 'Connect a native SV2 miner',
      message: 'Use the LAN address and external port shown by Interfaces > Native Stratum V2. A browser/Tor UI address is not necessarily reachable by your ASIC. Start GridPool once to generate the authority key. Use a worker label to use the configured payout address; this is not an SV1 endpoint.',
      result: {
        type: 'single' as const,
        value: `Host: ${settings?.minerHost || 'See Native Stratum V2 interface'}\nPreferred port: 34265 (use the interface port if remapped)\nProtocol: Stratum V2 Standard / Noise\nAuthority public key: ${publicKey || 'Not generated yet'}\nUsername: miner\n`,
        copyable: true,
        qr: false,
        masked: false,
      },
    }
  },
)
