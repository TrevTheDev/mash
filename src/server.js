/* eslint-disable max-classes-per-file */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */
import ShellHarnessM from '@trevthedev/shell-harness'
import {DEFAULT_CONFIG, glob, FILE_TYPE_ENUMS, CP_TYPE} from './util/globals.js'
import ExecutionContext from './locations/execution context.js'
import FsObject from './locations/fs object.js'
import Directory from './locations/types/directory.js'
import File from './locations/types/file.js'
import Symlink from './locations/types/symlink.js'
import BlockDevice from './locations/types/block device.js'
import CharacterDevice from './locations/types/character device.js'
import LocalSocket from './locations/types/local socket.js'
import NamedPipe from './locations/types/named pipe.js'
import Users from './user/users.js'
import FSObjectArray from './locations/fs object array.js'
import Logger from './logger.js'

export {FILE_TYPE_ENUMS, CP_TYPE}

export class ShellHarness extends ShellHarnessM {
  constructor(config) {
    const log = glob.logger ? {logger: glob.logger} : {}
    super({...DEFAULT_CONFIG.shell, ...log, ...config})
  }
}

export default class Server {
  constructor(config = {}) {
    if (Server.instance)
      throw new Error(
        'server already started - multiple servers are not supported'
      )
    Server.instance = this

    this._config = {...DEFAULT_CONFIG.server, ...config.server}
    this._config.shell = {
      ...DEFAULT_CONFIG.shell,
      ...config.shell
    }
    this._config.logger = {...DEFAULT_CONFIG.logger, ...config.logger}

    if (this.config.log) {
      glob.logger = new Logger(this.config.logger)
      this.config.shell.logger = glob.logger
    }

    Object.assign(glob, {
      FsObject,
      Directory,
      File,
      Symlink,
      BlockDevice,
      CharacterDevice,
      LocalSocket,
      NamedPipe,
      FSObjectArray
    })

    this._executionContext = new ExecutionContext(
      this,
      new ShellHarness({...this.config.shell}),
      {
        ...DEFAULT_CONFIG.executionContext,
        ...config.executionContext
      }
    )
    this._users = new Users(this.executionContext)
  }

  get executionContext() {
    return this._executionContext
  }

  get shell() {
    return this.executionContext.shell
  }

  sh(command, doneCBPayload, doneCallback, sendToEveryShell) {
    return this.executionContext.sh(
      command,
      doneCBPayload,
      doneCallback,
      sendToEveryShell
    )
  }

  get users() {
    return this._users
  }

  get config() {
    return this._config
  }

  /**
   *
   *
   * @param {Array<String>|String|Array<Path>|Path} paths | path
   * @param {ShellHarness} shellHarness - optional
   * @returns {FsObject}
   */
  u(paths, shellHarness) {
    const executionContext = shellHarness
      ? new ExecutionContext(this, shellHarness, this.executionContext.options)
      : this.executionContext
    return executionContext.u(paths)
  }

  emptyTrash() {
    return this.executionContext.emptyTrash()
  }

  get pwd() {
    return this.executionContext.pwd
  }

  async close() {
    if (this.shell) await this.shell.close()
    delete Server.instance
    return true
  }
}

process.on('uncaughtException', error => {
  console.error(`There was an uncaught error: ${error}`)
  if (glob.logger)
    glob.logger.error(
      `There was an uncaught error: ${error}`,
      'uncaughtException'
    )
  if (Server.instance)
    (async () => {
      await Server.instance.close()
    })()
  process.exit(1) // mandatory (as per the Node docs)
})

process.on('unhandledRejection', error => {
  console.log(`There was an unhandled rejections: ${error}`)
  if (glob.logger)
    glob.logger.error(
      `There was an unhandled rejections: ${error}`,
      'unhandledRejection'
    )
  if (Server.instance)
    (async () => {
      await Server.instance.close()
    })()
  throw error
})

process.on('warning', error => {
  console.warn(error.stack)
})

export const u = (paths, shellHarness) => {
  const server = Server.instance ? Server.instance : new Server()
  return server.u(paths, shellHarness)
}

export const sh = (command, doneCBPayload, doneCallback, sendToEveryShell) => {
  const server = Server.instance ? Server.instance : new Server()
  return server.sh(command, doneCBPayload, doneCallback, sendToEveryShell)
}
