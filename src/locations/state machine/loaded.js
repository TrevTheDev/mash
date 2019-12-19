import {loadableMixins} from './loadable.js'

/* eslint-disable no-param-reassign */
const mParts = Object.getOwnPropertyDescriptors({
  get permissions() {
    return this._permissions
  },

  get group() {
    return this.permissions.group
  },

  get user() {
    return this.permissions.user
  },

  get accessRights() {
    return this.permissions.octal
  },

  get size() {
    return this._props.size
  },

  toJSON(pathOnly = false, expandContent = true) {
    if (pathOnly) return this.path.toString()

    const json = {
      path: this.path.toJSON(),
      blocksAllocated: this.blocksAllocated,
      // accessRights: this.accessRights,
      deviceNumber: this.deviceNumber,
      type: this.type.name,
      // group: this.group.toJSON(),
      // user: this.user.toJSON(),
      numberHardLinks: this.numberHardLinks,
      inode: this.inode,
      majorDeviceType: this.majorDeviceType,
      minorDeviceType: this.minorDeviceType,
      timeOfBirth: this.timeOfBirth,
      timeOfLastAccess: this.timeOfLastAccess,
      timeOfLastModification: this.timeOfLastModification,
      timeOfLastMetaDataChange: this.timeOfLastMetaDataChange,
      timeOfLastAccessMicroSec: this.timeOfLastAccessMicroSec,
      timeOfLastModificationMicroSec: this.timeOfLastModificationMicroSec,
      timeOfLastMetaDataChangeMicroSec: this.timeOfLastMetaDataChangeMicroSec,
      contentType: this.contentType,
      fastContentType: this.fastContentType,
      uri: this.uri,
      icon: this.icon,
      symbolicIcon: this.symbolicIcon,
      etagValue: this.etagValue,
      fileId: this.fileId,
      mode: this.mode,
      rdev: this.rdev,
      lsattr: this.lsattr.toJSON(),
      size: this.size.toJSON(),
      loadedGio: this.loadedGio,
      loadedStat: this.loadedStat,
      loadedLsattr: this.loadedLsattr,
      permissions: this.permissions.toJSON()
    }
    if (expandContent && this._content)
      json.content = this._content.toJSON(pathOnly, expandContent)
    return json
  }
})

export const loadedMixin = {
  FsObject: {...loadableMixins.FsObject, ...mParts},
  Directory: {...loadableMixins.Directory, ...mParts},
  File: {...loadableMixins.File, ...mParts},
  Symlink: {...loadableMixins.Symlink, ...mParts},
  CharacterDevice: {...loadableMixins.CharacterDevice, ...mParts},
  BlockDevice: {...loadableMixins.BlockDevice, ...mParts},
  LocalSocket: {...loadableMixins.LocalSocket, ...mParts},
  NamedPipe: {...loadableMixins.NamedPipe, ...mParts}
}

export default {
  allowedEnterStates: ['loading'],
  enter(target) {
    Object.defineProperties(target, loadedMixin[target.constructor.name])
    Object.keys(target._props).forEach(key => {
      if (!(key in loadedMixin[target.constructor.name])) {
        Object.defineProperty(target, key, {
          configurable: true,
          enumerable: true,
          value: target._props[key],
          writable: false
        })
      }
    })
    return true
  },
  // eslint-disable-next-line no-unused-vars
  exit(target) {
    // Object.keys(mixin[target.constructor.name]).forEach(
    //   key => delete target[key]
    // )
    // Object.keys(target._props).forEach(key => delete target[key])
  }
}
