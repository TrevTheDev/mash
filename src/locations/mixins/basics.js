import EventEmitter from 'events'
import { FindBuilder } from '../../parsers/cmds.js'

export default class FsObjectBasic extends EventEmitter {
  /**
   * @param {ExecutionContext} executionContext
   * @param {PathContainer} paths
   */
  constructor(executionContext, paths) {
    super()
    this._paths = paths
    this._executionContext = executionContext
    this._pvt = {}
  }

  /**
   * @param {string} command
   * @param {Object} doneCBPayload
   * @param {function} doneCallback
   * @param {boolean} sendToEveryShell
   * @returns {CommandIFace}
   */
  sh(command, doneCBPayload = undefined, doneCallback = undefined, sendToEveryShell = undefined) {
    return this.executionContext.sh(command, doneCBPayload, doneCallback, sendToEveryShell)
  }

  /**
   * @returns {PathContainer}
   */
  get paths() {
    return this._paths
  }

  /**
   * @returns {Path}
   */
  get path() {
    return this.paths.path
  }

  /**
   * @returns {FsObjectPromise}
   */
  get parent() {
    if (this._pvt.parent) return this._pvt.parent
    const { parentPath } = this.path
    return this.path.isRoot || !parentPath
      ? undefined
      : this.executionContext.getFsObjectPromise(`${parentPath}`)
  }

  /**
   * @returns {Promise}
   */
  get exists() {
    return this.paths.exists()
  }

  /**
   * @returns {ExecutionContext}
   */
  get executionContext() {
    return this._executionContext
  }

  /**
   * @returns {String}
   */
  toString() {
    return this.path.toString()
  }

  /**
   * @returns {Object}
   */
  toJSON() {
    return { path: `${this.path}` }
  }

  /**
   * @returns {String}
   */
  toSh() {
    return this.path.toSh()
  }

  /**
   * @returns {FsObjectBasic}
   */
  markAsInvalid() {
    if (this._props) this.outdated = true
    return this
  }

  get find() {
    return new FindBuilder(this)
  }
}
