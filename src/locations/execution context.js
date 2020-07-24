/* eslint-disable no-param-reassign */
import { pwd, gioTrashEmpty } from '../parsers/cmds.js'

import {
  DirectoryPathed,
  FilePathed,
  SymlinkPathed,
  FsObjectPromise,
  FsObjectPromisePathed,
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
   * @returns {FsObjectPromise}
   */
  getFsObjectPromise(path = process.cwd()) {
    return new FsObjectPromise(this, new PathContainer(this, `${path}`))
  }

  /**
   * @param {string} path
   * @returns {FsObjectPromisePathed}
   */
  getFsObjectPromisePathed(path) {
    return new FsObjectPromisePathed(this, new PathContainer(this, undefined, path))
  }

  /**
   * @param {string} path
   * @returns {FilePathed}
   */
  getFilePathed(path) {
    return new FilePathed(this, new PathContainer(this, undefined, path))
  }

  /**
   * @param {string} path
   * @returns {DirectoryPathed}
   */
  getDirectoryPathed(path) {
    return new DirectoryPathed(this, new PathContainer(this, undefined, path))
  }

  /**
   * @param {string} path
   * @returns {SymlinkPathed}
   */
  getSymlinkPathed(path) {
    return new SymlinkPathed(this, new PathContainer(this, undefined, path))
  }

  /**
   * @param {Array} paths
   * @returns {FsObjectArray}
   */
  getFSObjArrayFromPaths(paths) {
    return new FsObjectArray(...paths.map((path) => this.getFsObjectPromise(path)))
  }

  /**
   * @param {Array<string|Path>|string|Path} paths
   * @returns {FsObjectArray|FsObjectPromise}
   */
  u(paths) {
    return Array.isArray(paths)
      ? this.getFSObjArrayFromPaths(paths)
      : this.getFsObjectPromise(paths)
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
   * @returns {Promise<DirectoryPathed>}
   */
  get pwd() {
    return pwd(this)
  }
}
