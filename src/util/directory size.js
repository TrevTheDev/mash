import Size from '../formatters/size.js'
import NumberWithCommas from '../formatters/number with commas.js'

export default class DirectorySize {
  constructor(bytes, diskUsageBytes, directoryCount, fileCount) {
    this._size = new Size(bytes)
    this._diskUsageBytes = new Size(diskUsageBytes)
    this._directoryCount = new NumberWithCommas(directoryCount)
    this._fileCount = new NumberWithCommas(fileCount)
  }

  get size() {
    return this._size
  }

  get diskUsage() {
    return this._diskUsageBytes
  }

  get directoryCount() {
    return this._directoryCount
  }

  get fileCount() {
    return this._fileCount
  }

  toString() {
    return `${this.size}`
  }

  valueOf() {
    return this.size.valueOf()
  }
}
