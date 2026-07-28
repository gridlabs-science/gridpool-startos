import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'gridpool',
  title: 'GridPool',
  license: 'MIT',
  packageRepo: 'https://github.com/gridlabs-science/gridpool-startos',
  upstreamRepo: 'https://github.com/gridlabs-science/boot-protocol',
  marketingUrl: 'https://gridpool.net',
  donationUrl: null,
  description: { short, long },
  volumes: ['main'],
  images: {
    gridpool: {
      source: {
        dockerTag: 'ghcr.io/gridlabs-science/boot-protocol:sha-97bc68c',
      },
      arch: ['x86_64', 'aarch64'],
    },
    sv2: {
      source: {
        dockerTag:
          'ghcr.io/gridlabs-science/gridpool-sv2-pool:sha-d690075',
      },
      arch: ['x86_64', 'aarch64'],
    },
  },
  dependencies: {
    bitcoind: {
      description: {
        en_US:
          'A synchronized Bitcoin Core or Bitcoin Knots service provides RPC and ZMQ.',
      },
      optional: false,
      metadata: {
        title: 'Bitcoin',
        icon: 'https://raw.githubusercontent.com/Start9Labs/bitcoin-core-startos/31.x/icon.svg',
      },
    },
  },
})
