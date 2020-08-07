import Size from '../../formatters/size.js'
// import NumberWithCommas from '../formatters/number with commas.js'

class DirectorySize {
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

const size = (sizeOutput, fsObj) => {
  const obj = fsObj._props
  // if (sizeOutput.includes('SIZEFAILED')) {
  //   obj.loadedSize = false
  //   obj.sizeOutput = sizeOutput
  //   return
  // }
  const sizeArray = sizeOutput.split('\0')
  const detailedArray = sizeArray[1].split('\n')
  const dirCount = parseInt(detailedArray[2], 10)
  const objCount = parseInt(detailedArray[1], 10)
  obj.size = new DirectorySize(
    parseInt(detailedArray[0], 10),
    parseInt(sizeArray[0].split(/\t/)[0], 10),
    dirCount,
    objCount - dirCount,
  )
  obj.loadedSize = true
}
export default size
