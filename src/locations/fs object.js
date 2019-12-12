import stateMachine from './state machine/state machine'
import {PathContainer} from './path'
import {glob, FILE_TYPE_ENUMS} from '../util/globals'

const EventEmitter = require('events')

export default class FsObject extends EventEmitter {
  constructor(executionContext, path, createAutomationFunctions = true) {
    super()
    this._createAutomationFunctions = createAutomationFunctions
    this._executionContext = executionContext
    this._paths = new PathContainer(this, path ? `${path}` : undefined)
    this._pvt = {}
    if (this._createAutomationFunctions) this._transitionState('init')
  }

  sh(command, doneCBPayload, doneCallback, sendToEveryShell) {
    return this.executionContext.sh(
      command,
      doneCBPayload,
      doneCallback,
      sendToEveryShell
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
    return {path: `${this.path}`}
  }

  toSh() {
    return this.path.toSh()
  }

  _transitionState(state) {
    return stateMachine.transition(this, state)
  }

  _changeToType(type) {
    if (![undefined, 'loading'].includes(this.state))
      throw new Error('wrong state')
    let nType
    switch (type) {
      case FILE_TYPE_ENUMS.symbolicLink:
        nType = new glob.Symlink(this.executionContext, this.path, false)
        break
      case FILE_TYPE_ENUMS.file:
        nType = new glob.File(this.executionContext, this.path, false)
        break
      case FILE_TYPE_ENUMS.directory:
        nType = new glob.Directory(this.executionContext, this.path, false)
        break
      case FILE_TYPE_ENUMS.characterDevice:
        nType = new glob.CharacterDevice(
          this.executionContext,
          this.path,
          false
        )
        break
      case FILE_TYPE_ENUMS.blockDevice:
        nType = new glob.BlockDevice(this.executionContext, this.path, false)
        break
      case FILE_TYPE_ENUMS.localSocket:
        nType = new glob.LocalSocket(this.executionContext, this.path, false)
        break
      case FILE_TYPE_ENUMS.namedPipe:
        nType = new glob.NamedPipe(this.executionContext, this.path, false)
        break
      default:
        throw new Error('not yet implemented')
    }
    delete nType._events
    nType._createAutomationFunctions = this._createAutomationFunctions
    Object.setPrototypeOf(this, nType)
  }
}
