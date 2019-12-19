/* eslint-disable no-param-reassign */
import {glob} from '../util/globals.js'
import pwd from '../parsers/pwd.js'
import gioTrashEmpty from '../parsers/gio trash empty.js'
import {pathNormaliser} from './path.js'

/**
 * U is a class the provides execution context
 *
 * @export
 * @class Locations
 */
export default class ExecutionContext {
  constructor(server, shell, options) {
    this._options = options
    this._server = server
    this._shell = shell
  }

  get options() {
    return this._options
  }

  get server() {
    return this._server
  }

  get shell() {
    return this._shell
  }

  getFSObjFromPath(path) {
    return new glob.FsObject(
      this,
      pathNormaliser(path || process.cwd()),
      undefined,
      this.options.createAutomationFunctions
    )
  }

  getFsObjectFromPath(path) {
    return new glob.FsObject(
      this,
      path,
      undefined,
      this.options.createAutomationFunctions
    )
  }

  getFileFromPath(path) {
    return new glob.File(
      this,
      path,
      undefined,
      this.options.createAutomationFunctions
    )
  }

  getDirectoryFromPath(path) {
    return new glob.Directory(
      this,
      path,
      undefined,
      this.options.createAutomationFunctions
    )
  }

  getSymlinkFromPath(path) {
    return new glob.Symlink(
      this,
      path,
      undefined,
      this.options.createAutomationFunctions
    )
  }

  getFSObjArrayFromPaths(paths) {
    return new glob.FSObjectArray(
      ...paths.map(path => this.getFSObjFromPath(path))
    )
  }

  u(paths) {
    return Array.isArray(paths)
      ? this.getFSObjArrayFromPaths(paths)
      : this.getFSObjFromPath(paths)
  }

  sh(command, elevateCmdType, progressCallback, sendToEveryShell) {
    return this.shell.createCommand(
      command,
      elevateCmdType,
      progressCallback,
      sendToEveryShell
    )
  }

  emptyTrash() {
    return gioTrashEmpty(this)
  }

  get pwd() {
    return pwd(this)
  }
}
