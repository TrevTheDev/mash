import { ShellHarness } from '../server.js'

export default class Elevator {
  constructor(
    passwordFunction,
    shellPoolConfig = {
      user: 'root',
    },
  ) {
    this.shellPoolConfig = shellPoolConfig
    this.passwordFunction = passwordFunction
    this.regexs = {
      chmod: [/Permission denied/g],
      chown: [/Operation not permitted/g],
      chgrp: [/Operation not permitted/g],
      cp: [/Permission denied/g],
      mkdir: [/Permission denied/g],
      mv: [/Permission denied/g],
      rm: [/Permission denied/g, /Directory not empty/g],
      realpath: [/Permission denied/g],
      rsync: [/Permission denied/g],
      'gio trash': [/Permission denied/g],
      touch: [/Permission denied/g],
      matchAttrs: [/Permission denied/g],
    }
    return this
  }

  async elevateIfRequired(cmd, elevatorCmdType) {
    if (!elevatorCmdType) {
      return {
        error: cmd.error,
        command: cmd.command,
        output: cmd.output,
      }
    }
    const match = this.regexs[elevatorCmdType].find((regex) => cmd.output.match(regex))

    if (!match) {
      return {
        error: cmd.error,
        command: cmd.command,
        output: cmd.output,
      }
    }

    const shell = await this.shell()
    const finalCommand = await shell.createCommand(cmd.command)
    if (shell.runningCommands === 0) {
      shell.close()
      this._shell = undefined
    }

    return finalCommand
  }

  /**
   * @returns {ShellHarness}
   */
  async shell() {
    if (this._shell) return this._shell
    this._shell = new ShellHarness(this.shellPoolConfig)
    this._shell.config.rootPassword = await this.passwordFunction()
    return this._shell
  }

  close() {
    if (this._shell) this._shell.close()
    this._shell = undefined
  }
}
