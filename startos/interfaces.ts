import { sdk } from './sdk'
import { sv2Port, uiPort } from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const uiOrigin = await sdk.MultiHost.of(effects, 'ui').bindPort(uiPort, {
    protocol: 'http',
  })
  const ui = sdk.createInterface(effects, {
    name: 'GridPool Web UI',
    id: 'ui',
    description: 'Private GridPool status and configuration interface',
    type: 'ui',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })

  const sv2Origin = await sdk.MultiHost.of(effects, 'sv2').bindPort(sv2Port, {
    protocol: null,
    addSsl: null,
    preferredExternalPort: sv2Port,
    secure: { ssl: false },
  })
  const sv2 = sdk.createInterface(effects, {
    name: 'Native Stratum V2',
    id: 'sv2',
    description: 'Native SV2 mining endpoint',
    type: 'api',
    masked: false,
    schemeOverride: { ssl: null, noSsl: 'stratum2+noise' },
    username: null,
    path: '',
    query: {},
  })

  return [await uiOrigin.export([ui]), await sv2Origin.export([sv2])]
})
