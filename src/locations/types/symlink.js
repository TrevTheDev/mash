/* eslint-disable no-eval, no-unused-vars */
import SymlinkBase from '../mixins/symlink base.js'
import { PathContainer } from '../path.js'
import {
  baseStatProperties,
  symlinkStatProperties,
  baseStatPropertyPromises,
  symlinkStatPropertyPromises,
} from '../mixins/property builders.js'
import { FILE_TYPE_ENUMS } from '../../util/globals.js'

const clsTemplate = `(class CLSNAME extends SymlinkBase {
  constructor(executionContext, pathContainer, statObject) {
    super(executionContext, pathContainer)
    this._props = statObject
  }
  
  get type() { return FILE_TYPE_ENUMS.symbolicLink }
  
  PROPS
})`

const newClass = eval(
  clsTemplate
    .replace('CLSNAME', 'Symlink')
    .replace('PROPS', baseStatProperties + symlinkStatProperties),
)

const pathedClass = eval(
  clsTemplate
    .replace('CLSNAME', 'SymlinkPathed')
    .replace('PROPS', baseStatPropertyPromises + symlinkStatPropertyPromises),
)

export {
  newClass as Symlink,
  pathedClass as SymlinkPathed,
}
