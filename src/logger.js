import fs from 'fs'

export default class Logger {
  constructor(config) {
    this._config = config
    this._writeStreams = {}
    Object.keys(config.file).forEach((key) => {
      if (config.file[key]) {
        this._writeStreams[key] = fs.createWriteStream(config.file[key], {
          flags: 'w',
        })
      }
    })
  }

  get config() {
    return this._config
  }

  get writeStreams() {
    return this._writeStreams
  }

  info(message, source) {
    return this.log('info', message, source)
  }

  debug(message, source) {
    return this.log('debug', message, source)
  }

  log(level, message, source) {
    if (this.config.console[level]) {
      console.log(
        `${new Date().toLocaleTimeString()}: ${level}: ${source}: ${message}\n`,
      )
    }
    if (this.writeStreams[level]) {
      this.writeStreams[level].write(
        `${new Date().toLocaleString()}: ${level}: ${source}: ${message}\n`,
      )
    }
  }

  error(message, source) {
    return this.log('error', message, source)
  }
}
