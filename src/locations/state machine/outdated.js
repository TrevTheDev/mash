import {propertiesThatRequireStat} from './init.js'
import {loadedMixin} from './loaded.js'

/* eslint-disable no-param-reassign */
// const mixin = {}

export default {
  allowedEnterStates: ['loaded'],
  enter(target) {
    // Object.defineProperties(target, Object.getOwnPropertyDescriptors(mixin))

    if (target._createAutomationFunctions) {
      let i = 0
      const stat = async () => {
        i += 1
        if (!target._statPromise) {
          if (target.state !== 'outdated') return // assume stated if state has changed
          target._statPromise = target.stat()
        }
        await target._statPromise
        i -= 1
        if (i === 0) target._statPromise = undefined
      }
      propertiesThatRequireStat[target.constructor.name].forEach((prop) => {
        Object.defineProperty(target, prop, {
          configurable: true,
          enumerable: true,
          get: () => {
            return new Promise((resolve) => {
              // console.log(`outdated: stat: ${target}: ${target.state}: ${prop}`)
              stat().then(() => resolve(target[prop]))
            })
          },
        })
      })
    }
    return true
  },
  exit(target) {
    if (target._createAutomationFunctions)
      propertiesThatRequireStat[target.constructor.name].forEach(
        (key) => delete target[key]
      )
    Object.keys(loadedMixin[target.constructor.name]).forEach(
      (key) => delete target[key]
    )
    Object.keys(target._props).forEach((key) => delete target[key])
  },
}
