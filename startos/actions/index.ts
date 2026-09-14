import { sdk } from '../sdk'
import { configure } from './configure'
import { connect } from './connect'

export const actions = sdk.Actions.of().addAction(configure).addAction(connect)
