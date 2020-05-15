import {FILE_TYPE_ENUMS} from '../util/globals.js'

export default class FSObjectArray extends Array {
  // async deleteAll() {
  //   console.log(this)
  // }

  get directories() {
    return this.filter(fsObj => fsObj.type === FILE_TYPE_ENUMS.directory)
  }

  get files() {
    return this.filter(fsObj => fsObj.type === FILE_TYPE_ENUMS.file)
  }

  async loadAll(gio, lsattr, size) {
    await Promise.all(
      this.directories.map(directory => {
        return directory.dir(gio, lsattr, size, true)
      })
    )
  }

  toString() {
    return this.map(fsObj => `${fsObj}`)
  }

  toJSON(pathOnly = false, content = true) {
    const arr = []
    this.forEach(fsObj => arr.push(fsObj.toJSON(pathOnly, content)))
    return arr
  }
}
