/* eslint-disable no-eval, no-unused-vars */
import { FILE_TYPE_ENUMS } from '../../util/globals.js'
import FileBase from '../mixins/file base.js'
import { PathContainer } from '../path.js'

import {
  baseStatProperties,
  baseStatPropertyPromises,
} from '../mixins/property builders.js'

const clsTemplateBase = `(class CLSNAME extends FileBase {
  constructor(executionContext, pathContainer, statObject) {
    super(executionContext, pathContainer)
    this._props = statObject
  }

  get type() { 
    return FILE_TYPE_ENUMS.LCTYPE 
  }
    
  PROPS
})`

const types = ['File', 'BlockDevice', 'CharacterDevice', 'LocalSocket', 'NamedPipe']

const classes = types.map((type) => {
  let clsTemplate = clsTemplateBase.replace('CLSTYPE', type)
  clsTemplate = clsTemplate.replace('LCTYPE', type.charAt(0).toLowerCase() + type.slice(1))

  return [eval(clsTemplate.replace('CLSNAME', type).replace('PROPS', baseStatProperties)),
    eval(clsTemplate.replace('CLSNAME', `${type}Pathed`).replace('PROPS', baseStatPropertyPromises))]
})
export const File = classes[0][0]
export const FilePathed = classes[0][1]
export const BlockDevice = classes[1][0]
export const BlockDevicePathed = classes[1][1]
export const CharacterDevice = classes[2][0]
export const CharacterDevicePathed = classes[2][1]
export const LocalSocket = classes[3][0]
export const LocalSocketPathed = classes[3][1]
export const NamedPipe = classes[4][0]
export const NamedPipePathed = classes[4][1]
