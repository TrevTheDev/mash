/* eslint-disable no-param-reassign */

import CopyManager from '../../parsers/copy/copy manager.js'
import FindBuilder from '../find builder.js'

const ftpParts = {
  directory: ['addDirectory', 'addFile', 'dir', 'cd'],
  file: ['read', 'readStream', 'write', 'writeStream', 'append', 'readChunk', 'writeChunk'],
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
    'setGroup',
  ],
}
const functionsThatRequirePath = {
  FsObject: [
    ...ftpParts.directory,
    ...ftpParts.file,
    ...ftpParts.symlink,
    ...ftpParts.shared,
  ],
  Directory: [...ftpParts.directory, ...ftpParts.shared],
  File: [...ftpParts.file, ...ftpParts.shared],
  Symlink: [
    ...ftpParts.directory,
    ...ftpParts.file,
    ...ftpParts.symlink,
    ...ftpParts.shared,
  ],
  CharacterDevice: [...ftpParts.file, ...ftpParts.shared],
  BlockDevice: [...ftpParts.file, ...ftpParts.shared],
  LocalSocket: [...ftpParts.file, ...ftpParts.shared],
  NamedPipe: [...ftpParts.file, ...ftpParts.shared],
}
// 'copyTo',
// 'moveTo',
// 'toString'

const ptpParts = {
  shared: ['parent', 'size'],
  directory: ['content'],
}

const propertiesThatRequirePath = {
  FsObject: [...ptpParts.directory, ...ptpParts.shared],
  Directory: [...ptpParts.directory, ...ptpParts.shared],
  File: [...ptpParts.shared],
  Symlink: [...ptpParts.directory, ...ptpParts.shared],
  CharacterDevice: [...ptpParts.shared],
  BlockDevice: [...ptpParts.shared],
  LocalSocket: [...ptpParts.shared],
  NamedPipe: [...ptpParts.shared],
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
    'permissions',
  ],
  symlink: ['linkTarget', 'linkEndTarget'],
}
export const propertiesThatRequireStat = {
  FsObject: [...prsParts.symlink, ...prsParts.shared, 'type'],
  Directory: [...prsParts.shared],
  File: [...prsParts.shared],
  Symlink: [...prsParts.symlink, ...prsParts.shared],
  CharacterDevice: [...prsParts.shared],
  BlockDevice: [...prsParts.shared],
  LocalSocket: [...prsParts.shared],
  NamedPipe: [...prsParts.shared],
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
      confirmOverwriteCallBack,
    )
  },

  moveTo(destinationDirectory, copyType, confirmOverwriteCallBack) {
    return new CopyManager(
      this,
      destinationDirectory,
      copyType,
      confirmOverwriteCallBack,
      true,
    )
  },

  get find() {
    return new FindBuilder(this)
  },

  then(...thenArgs) {
    if (this.state === 'init') {
      this._canonizePromise = this._canonizePromise || this._paths.canonize()
      this._canonizePromise.then((path) => {
        if (path) {
          this._transitionState('loadable')
          delete this._canonizePromise
          thenArgs[0](this)
        } else thenArgs[1]('path not found')
      })
      // should never hit
    } else thenArgs[0](this)
  },
}

export default {
  allowedEnterStates: [undefined],
  enter(target) {
    Object.defineProperties(target, Object.getOwnPropertyDescriptors(mixin))
    if (target._createAutomationFunctions) {
      functionsThatRequirePath[target.constructor.name].forEach((prop) => {
        target[prop] = async (...theArgs) => {
          await target
          return target[prop](...theArgs)
        }
      })
      const defineProperty = (prop) => {
        Object.defineProperty(target, prop, {
          configurable: true,
          enumerable: true,
          get: () => new Promise((resolve) => target.then((result) => resolve(result[prop]))),
        })
      }
      propertiesThatRequirePath[target.constructor.name].forEach((prop) => defineProperty(prop))
      propertiesThatRequireStat[target.constructor.name].forEach((prop) => defineProperty(prop))
    }
    return true
  },
  exit(target) {
    Object.keys(mixin).forEach((key) => delete target[key])
    if (target._createAutomationFunctions) {
      functionsThatRequirePath[target.constructor.name].forEach(
        (prop) => delete target[prop],
      )
      propertiesThatRequirePath[target.constructor.name].forEach(
        (prop) => delete target[prop],
      )
      propertiesThatRequireStat[target.constructor.name].forEach(
        (prop) => delete target[prop],
      )
    }
  },
}
