/* eslint-disable no-param-reassign */
import { pwd, gioTrashEmpty } from '../parsers/cmds.js'

import {
  DirectoryPromise,
  FilePromise,
  SymlinkPromise,
  FsObject,
  FsObjectArray,
} from './fs objects.js'
import { PathContainer } from './path.js'

export default class ExecutionContext {
  /**
   * @param {Server} server
   * @param {ShellHarness} shell
   * @param {Object} options
   * @returns {ExecutionContext}
   */
  constructor(server, shell, options) {
    this._options = options
    this._server = server
    this._shell = shell
  }

  /**
   * @returns {Object}
   */
  get options() {
    return this._options
  }

  /**
   * @returns {Server}
   */
  get server() {
    return this._server
  }

  /**
   * @returns {ShellHarness}
   */
  get shell() {
    return this._shell
  }

  /**
   * @param {string|Path} path
   * @returns {FsObject}
   */
  getFsObject(path = process.cwd()) {
    return new FsObject(this, new PathContainer(this, `${path}`))
  }

  /**
   * @param {string} path
   * @returns {FsObject}
   */
  getFsObjectPathed(path) {
    return new FsObject(this, new PathContainer(this, undefined, path))
  }

  /**
   * @param {string} path
   * @returns {FilePromise}
   */
  getFilePromise(path) {
    return new FilePromise(this, new PathContainer(this, undefined, path))
  }

  /**
   * @param {string} path
   * @returns {DirectoryPromise}
   */
  getDirectoryPromise(path) {
    return new DirectoryPromise(this, new PathContainer(this, undefined, path))
  }

  /**
   * @param {string} path
   * @returns {SymlinkPromise}
   */
  getSymlinkPromise(path) {
    return new SymlinkPromise(this, new PathContainer(this, undefined, path))
  }

  /**
   * @param {Array} paths
   * @returns {FsObjectArray}
   */
  getFSObjArrayFromPaths(paths) {
    return new FsObjectArray(...paths.map((path) => this.getFsObject(path)))
  }

  /**
   * @param {Array<string|Path>|string|Path} paths
   * @returns {FsObjectArray|FsObject}
   */
  u(paths) {
    return Array.isArray(paths)
      ? this.getFSObjArrayFromPaths(paths)
      : this.getFsObject(paths)
  }

  /**
   * @param {string} command
   * @param {Object} doneCBPayload
   * @param {function} doneCallback
   * @param {boolean} sendToEveryShell
   * @returns {CommandIFace}
   */
  sh(command, doneCBPayload = undefined, doneCallback = undefined, sendToEveryShell = undefined) {
    return this.shell.createCommand(command, doneCBPayload, doneCallback, sendToEveryShell)
  }

  /**
   * @returns {Promise<boolean>}
   */
  emptyTrash() {
    return gioTrashEmpty(this)
  }

  /**
   * @returns {DirectoryPromise}
   */
  get pwd() {
    return pwd(this)
  }
}
