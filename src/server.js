/* eslint-disable max-classes-per-file */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */
import ShellHarnessM from '@trevthedev/shell-harness'
import {
  DEFAULT_CONFIG, glob, FILE_TYPE_ENUMS, CP_TYPE,
} from './util/globals.js'
import ExecutionContext from './locations/execution context.js'
import Users from './user/users.js'
// import FsObjectArray from './locations/fs object array.js'
import Logger from './logger.js'

export { FILE_TYPE_ENUMS, CP_TYPE }

export class ShellHarness extends ShellHarnessM {
  constructor(config) {
    const log = glob.logger ? { logger: glob.logger } : {}
    super({ ...DEFAULT_CONFIG.shell, ...log, ...config })
  }
}

export default class Server {
  constructor(config = {}) {
    if (Server.instance) throw new Error('server already started - multiple servers are not supported')

    Server.instance = this

    this._config = { ...DEFAULT_CONFIG.server, log: config.log, ...config.server }
    this._config.shell = {
      ...DEFAULT_CONFIG.shell,
      ...config.shell,
    }
    this._config.logger = { ...DEFAULT_CONFIG.logger, ...config.logger }

    if (this.config.log) {
      glob.logger = new Logger(this.config.logger)
      this.config.shell.logger = glob.logger
    }

    // Object.assign(glob, {
    //   FsObject,
    //   Directory,
    //   File,
    //   Symlink,
    //   BlockDevice,
    //   CharacterDevice,
    //   LocalSocket,
    //   NamedPipe,
    //   FsObjectArray,
    // })

    this._executionContext = new ExecutionContext(
      this,
      new ShellHarness({ ...this.config.shell }),
      {
        ...DEFAULT_CONFIG.executionContext,
        ...config.executionContext,
      },
    )
    this._users = new Users(this.executionContext)
  }

  /**
   * @returns {ExecutionContext}
   */
  get executionContext() {
    return this._executionContext
  }

  /**
   * @returns {ShellHarness}
   */
  get shell() {
    return this.executionContext.shell
  }

  /**
   * @param {string} command
   * @param {Object} doneCBPayload
   * @param {function} doneCallback
   * @param {boolean} sendToEveryShell
   * @returns {CommandIFace}
   */
  sh(command, doneCBPayload = undefined, doneCallback = undefined, sendToEveryShell = undefined) {
    return this.executionContext.sh(
      command,
      doneCBPayload,
      doneCallback,
      sendToEveryShell,
    )
  }

  /**
   * @returns {Users}
   */
  get users() {
    return this._users
  }

  /**
   * @returns {Object}
   */
  get config() {
    return this._config
  }

  /**
   * @param {Array<string|Path>|string|Path} paths
   * @param {ShellHarness} shellHarness - optional
   * @returns {FsObjectArray|FsObjectPromise}
   */
  u(paths, shellHarness = undefined) {
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

process.on('uncaughtException', (error) => {
  console.error(`There was an uncaught error: ${error.stack}`)
  if (glob.logger) {
    glob.logger.error(
      `There was an uncaught error: ${error}`,
      'uncaughtException',
    )
  }
  if (Server.instance) {
    (async () => {
      await Server.instance.close()
    })()
  }
  process.exit(1) // mandatory (as per the Node docs)
})

process.on('unhandledRejection', (error) => {
  console.log(`There was an unhandled rejections: ${error.stack}`)
  if (glob.logger) {
    glob.logger.error(
      `There was an unhandled rejections: ${error}`,
      'unhandledRejection',
    )
  }
  if (Server.instance) {
    (async () => {
      await Server.instance.close()
    })()
  }
  throw error
})

process.on('warning', (error) => {
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
