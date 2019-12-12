import FsObject from '../fs object'
import {FILE_TYPE_ENUMS} from '../../util/globals'

export default class LocalSocket extends FsObject {
  constructor(u, path, createAutomationFunctions) {
    super(u, path, createAutomationFunctions)
    delete this.type
    this.type = FILE_TYPE_ENUMS.LocalSocket
    return this
  }
}

// export default File
