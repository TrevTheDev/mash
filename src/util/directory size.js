import Size from '../formatters/size.js'
// import NumberWithCommas from '../formatters/number with commas.js'

export default class DirectorySize {
  constructor(bytes, diskUsageBytes, directoryCount, fileCount) {
    this.bytes = bytes
    this.diskUsageBytes = diskUsageBytes
    this.directoryCount = directoryCount
    this.fileCount = fileCount
  }

  get size() {
    return this.bytes
  }

  toString() {
    return `${new Size(this.bytes)}`
  }

  valueOf() {
    return this.bytes
  }

  toJSON() {
    return {
      bytes: this.bytes,
      diskUsageBytes: this.diskUsageBytes,
      directoryCount: this.directoryCount,
      fileCount: this.fileCount,
    }
  }
}
