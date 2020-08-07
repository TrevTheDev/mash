import FsObject from './fs object.js'
import { FILE_TYPE_ENUMS } from '../../src/util/globals.js'

export default class BlockDevice extends FsObject {
  constructor(u, path, createAutomationFunctions) {
    super(u, path, createAutomationFunctions)
    delete this.type
    this.type = FILE_TYPE_ENUMS.BlockDevice
    return this
  }
}
