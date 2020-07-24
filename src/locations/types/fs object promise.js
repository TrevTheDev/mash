/* eslint-disable no-eval, no-unused-vars */
import { FILE_TYPE_ENUMS } from '../../util/globals.js'
import { PathContainer, pathNormaliser } from '../path.js'
import FsObjectBasic from '../mixins/basics.js'
import FsObjectPromisePathed from './fs object promise pathed.js'
import { promiseFunctions, promiseProperties } from '../mixins/property builders.js'

const clsTemplateBase = `(class FsObjectPromiseBase extends FsObjectBasic {
  then(...thenArgs) {
    this._canonizePromise = this._canonizePromise || this.paths.canonizeRequestPath()
    this._canonizePromise.then((path) => {
      if (path) {
        this._canonizePromise = undefined
        const result = new FsObjectPromisePathed(this.executionContext, this.paths)
        thenArgs[0](result)
      } else thenArgs[1]('path not found')
    })
  }
  
  PROPS
})`

const FsObjectPromise = eval(clsTemplateBase.replace('PROPS', promiseProperties + promiseFunctions))
export default FsObjectPromise
