/* eslint-disable no-param-reassign */
import init from './init.js'
import loadable from './loadable.js'
import loading from './loading.js'
import loaded from './loaded.js'
import outdated from './outdated.js'

export default {
  transition(target, toState) {
    if (!this[toState].allowedEnterStates.includes(target.state)) throw new Error('invalid state transition')

    if (this[target.state] && this[target.state].exit) this[target.state].exit(target)
    const didTransition = this[toState].enter(target)
    if (didTransition) target.state = toState
    return didTransition ? target : false
  },
  init,
  loadable,
  loading,
  loaded,
  outdated,
}
