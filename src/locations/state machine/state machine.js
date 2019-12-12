/* eslint-disable no-param-reassign */
import init from './init'
import loadable from './loadable'
import loading from './loading'
import loaded from './loaded'
import outdated from './outdated'

export default {
  transition(target, toState) {
    if (!this[toState].allowedEnterStates.includes(target.state))
      throw new Error('invalid state transition')

    if (this[target.state] && this[target.state].exit)
      this[target.state].exit(target)
    const didTransition = this[toState].enter(target)
    if (didTransition) target.state = toState
    return didTransition ? target : false
  },
  init,
  loadable,
  loading,
  loaded,
  outdated
}
