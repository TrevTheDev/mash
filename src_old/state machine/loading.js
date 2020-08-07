/* eslint-disable no-param-reassign */

// const mixin = {}

export default {
  allowedEnterStates: ['init', 'loadable', 'loading', 'loaded', 'outdated'],
  enter(/* target */) {
    // Object.assign(target, mixin)
    return true
  },
  exit(/* target */) {
    // Object.keys(mixin).forEach(key => delete target[key])
  }
}
