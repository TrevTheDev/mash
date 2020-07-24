/* eslint-disable no-eval, no-unused-vars */
import DirectoryBase from '../mixins/directory base.js'
import { PathContainer } from '../path.js'
import {
  baseStatProperties,
  baseStatPropertyPromises,
} from '../mixins/property builders.js'

const clsTemplate = `(class CLSNAME extends DirectoryBase {
  constructor(executionContext, pathContainer, statObject) {
    super(executionContext, pathContainer)
    this._props = statObject
  }
  
  PROPS
})`

const newClass = eval(clsTemplate.replace('CLSNAME', 'Directory').replace('PROPS', baseStatProperties))

const pathedClass = eval(clsTemplate.replace('CLSNAME', 'DirectoryPathed').replace('PROPS', baseStatPropertyPromises))

export {
  newClass as Directory,
  pathedClass as DirectoryPathed,
}
