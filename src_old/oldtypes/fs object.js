import EventEmitter from 'events'
import stateMachine from '../../src/locations/state machine/state machine.js'
import { PathContainer } from '../../src/locations/path.js'
import { glob, FILE_TYPE_ENUMS } from '../../src/util/globals.js'

export default class FsObject extends EventEmitter {
  // state
  // deleted
  // _props
  // _permissions
  constructor(executionContext, path, createAutomationFunctions = true) {
    super()
    this._createAutomationFunctions = createAutomationFunctions
    this._executionContext = executionContext
    this._paths = new PathContainer(executionContext, path ? `${path}` : undefined)
    this._pvt = {}
    if (this._createAutomationFunctions) this._transitionState('init')
  }

  sh(command, doneCBPayload, doneCallback, sendToEveryShell) {
    return this.executionContext.sh(
      command,
      doneCBPayload,
      doneCallback,
      sendToEveryShell,
    )
  }

  get paths() {
    return this._paths
  }

  get path() {
    return this._paths.path
  }

  get exists() {
    return this._paths.exists()
  }

  get executionContext() {
    return this._executionContext
  }

  toString() {
    return this.path.toString()
  }

  toJSON() {
    return { path: `${this.path}` }
  }

  toSh() {
    return this.path.toSh()
  }

  _transitionState(state) {
    return stateMachine.transition(this, state)
  }
}
