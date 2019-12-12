/* eslint-disable no-param-reassign */
// import deasync from 'deasync'
import CopyManager from '../../parsers/copy/copy manager'
import FindBuilder from './find builder'
// import {LOCAL} from '../../util/globals'
// import {ChainablePromise} from '../../util/utils'

const ftpParts = {
  directory: ['addDirectory', 'addFile', 'dir', 'cd'],
  file: ['read', 'write', 'append', 'readChunk', 'writeChunk', 'writeStream'],
  symlink: ['linkTo'],
  shared: [
    'u',
    'stat',
    'cloneAttrs',
    'rename',
    'touch',
    'delete',
    'trash',
    'setPermissions',
    'setUser',
    'setGroup'
  ]
}
const functionsThatRequirePath = {
  FsObject: [
    ...ftpParts.directory,
    ...ftpParts.file,
    ...ftpParts.symlink,
    ...ftpParts.shared
  ],
  Directory: [...ftpParts.directory, ...ftpParts.shared],
  File: [...ftpParts.file, ...ftpParts.shared],
  Symlink: [
    ...ftpParts.directory,
    ...ftpParts.file,
    ...ftpParts.symlink,
    ...ftpParts.shared
  ],
  CharacterDevice: [...ftpParts.file, ...ftpParts.shared],
  BlockDevice: [...ftpParts.file, ...ftpParts.shared],
  LocalSocket: [...ftpParts.file, ...ftpParts.shared],
  NamedPipe: [...ftpParts.file, ...ftpParts.shared]
}
// 'copyTo',
// 'moveTo',
// 'toString'

const ptpParts = {
  shared: ['parent', 'size'],
  directory: ['content']
}

const propertiesThatRequirePath = {
  FsObject: [...ptpParts.directory, ...ptpParts.shared],
  Directory: [...ptpParts.directory, ...ptpParts.shared],
  File: [...ptpParts.shared],
  Symlink: [...ptpParts.directory, ...ptpParts.shared],
  CharacterDevice: [...ptpParts.shared],
  BlockDevice: [...ptpParts.shared],
  LocalSocket: [...ptpParts.shared],
  NamedPipe: [...ptpParts.shared]
}

const prsParts = {
  shared: [
    'accessRights',
    'blocksAllocated',
    'deviceNumber',
    'group',
    'numberHardLinks',
    'inode',
    'majorDeviceType',
    'minorDeviceType',
    'user',
    'timeOfBirth',
    'timeOfLastAccess',
    'timeOfLastModification',
    'timeOfLastMetaDataChange',
    'timeOfLastAccessMicroSec',
    'timeOfLastModificationMicroSec',
    'timeOfLastMetaDataChangeMicroSec',
    'contentType',
    'fastContentType',
    'uri',
    'icon',
    'symbolicIcon',
    'etagValue',
    'fileId',
    'mode',
    'rdev',
    'lsattr',
    'permissions'
  ],
  symlink: ['linkTarget', 'linkEndTarget']
}
export const propertiesThatRequireStat = {
  FsObject: [...prsParts.symlink, ...prsParts.shared, 'type'],
  Directory: [...prsParts.shared],
  File: [...prsParts.shared],
  Symlink: [...prsParts.symlink, ...prsParts.shared],
  CharacterDevice: [...prsParts.shared],
  BlockDevice: [...prsParts.shared],
  LocalSocket: [...prsParts.shared],
  NamedPipe: [...prsParts.shared]
}
// 'path',
// 'canRead',
// 'canWrite',
// 'canExecute',
// 'canDelete',
// 'canTrash',
// 'canRename',
// 'userReal'

const mixin = {
  copyTo(destinationDirectory, copyType, confirmOverwriteCallBack) {
    return new CopyManager(
      this,
      destinationDirectory,
      copyType,
      confirmOverwriteCallBack
    )
  },

  moveTo(destinationDirectory, copyType, confirmOverwriteCallBack) {
    return new CopyManager(
      this,
      destinationDirectory,
      copyType,
      confirmOverwriteCallBack,
      true
    )
  },

  get find() {
    return new FindBuilder(this)
  },

  async then(resolve, reject) {
    if (this.state === 'init') {
      this._canonizePromise = this._canonizePromise
        ? this._canonizePromise
        : this._paths.canonize()
      const path = await this._canonizePromise
      if (path) {
        this._transitionState('loadable')
        delete this._canonizePromise
        resolve(this)
      } else reject('path not found') // should never hit
    } else resolve(this)
  }
  // eslint-disable-next-line consistent-return
  // then(onFulfilled, onRejected) {
  //   if (this.state !== 'init') return this
  //   onFulfilled(
  //     new Promise(results => {
  //       this._canonizePromise = this._canonizePromise
  //         ? this._canonizePromise
  //         : this._paths.canonize()

  //       this._canonizePromise.then(path => {
  //         if (!path) throw new Error(LOCAL.pathNotFound)
  //         this._transitionState('loadable')
  //         // delete this._canonizePromise
  //         results(this)
  //       })
  //     })
  //   )
  // }
}

export default {
  allowedEnterStates: [undefined],
  enter(target) {
    Object.defineProperties(target, Object.getOwnPropertyDescriptors(mixin))
    if (target._createAutomationFunctions) {
      functionsThatRequirePath[target.constructor.name].forEach(prop => {
        target[prop] = async (...theArgs) => {
          await target
          return target[prop](...theArgs)
        }
      })
      const defineProperty = prop => {
        Object.defineProperty(target, prop, {
          configurable: true,
          enumerable: true,
          get: () => {
            //   let i = 0
            //   let obj
            //   target.then(done => {
            //     obj = done
            //   })
            //   deasync.loopWhile(() => {
            //     i += 1
            //     console.log(`init - ${prop} - ${i}:${target}: ${target.state}`)
            //     return target && obj === undefined && i < 1000
            //   })
            //   return obj[prop]
            // }
            console.log(prop)
            return new Promise(resolve =>
              target.then(result => resolve(result[prop]))
            )
          }
        })
      }
      propertiesThatRequirePath[target.constructor.name].forEach(prop =>
        defineProperty(prop)
      )
      propertiesThatRequireStat[target.constructor.name].forEach(prop =>
        defineProperty(prop)
      )
    }
    return true
  },
  exit(target) {
    Object.keys(mixin).forEach(key => delete target[key])
    if (target._createAutomationFunctions) {
      functionsThatRequirePath[target.constructor.name].forEach(
        prop => delete target[prop]
      )
      propertiesThatRequirePath[target.constructor.name].forEach(
        prop => delete target[prop]
      )
      propertiesThatRequireStat[target.constructor.name].forEach(
        prop => delete target[prop]
      )
    }
  }
}
