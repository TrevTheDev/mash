/* eslint-disable max-classes-per-file, class-methods-use-this */
import directoryMixin from './directory base.js'
import fileMixin from './file base.js'
import symlinkMixin from './symlink base.js'
import FsObjectCommon from './common.js'
import { FILE_TYPE_ENUMS } from '../../util/globals.js'

const baseLoadedMixin = (Base) => class extends Base {
  _props = {}

  constructor(executionContext, pathContainer, statObject) {
    super(executionContext, pathContainer)
    this._props = statObject
  }

  get group() { return this.permissions.group }

  get user() { return this.permissions.user }

  get accessRights() { return this.permissions.octal }

  get permissions() { return this._props.permissions }

  get size() { return this._props.size }

  get blocksAllocated() { return this._props.blocksAllocated }

  get deviceNumber() { return this._props.deviceNumber }

  get numberHardLinks() { return this._props.numberHardLinks }

  get inode() { return this._props.inode }

  get majorDeviceType() { return this._props.majorDeviceType }

  get minorDeviceType() { return this._props.minorDeviceType }

  get timeOfBirth() { return this._props.timeOfBirth }

  get timeOfLastAccess() { return this._props.timeOfLastAccess }

  get timeOfLastModification() { return this._props.timeOfLastModification }

  get timeOfLastMetaDataChange() { return this._props.timeOfLastMetaDataChange }

  get timeOfLastAccessMicroSec() { return this._props.timeOfLastAccessMicroSec }

  get timeOfLastModificationMicroSec() { return this._props.timeOfLastModificationMicroSec }

  get timeOfLastMetaDataChangeMicroSec() { return this._props.timeOfLastMetaDataChangeMicroSec }

  get contentType() { return this._props.contentType }

  get fastContentType() { return this._props.fastContentType }

  get uri() { return this._props.uri }

  get icon() { return this._props.icon }

  get symbolicIcon() { return this._props.symbolicIcon }

  get etagValue() { return this._props.etagValue }

  get fileId() { return this._props.fileId }

  get mode() { return this._props.mode }

  get rdev() { return this._props.rdev }

  get lsattr() { return this._props.lsattr }

  get loadedStat() { return this._props.loadedStat }

  get loadedGio() { return this._props.loadedGio }

  get loadedLsattr() { return this._props.loadedLsattr }
}

const symLinkLoadedMixin = (Base) => class extends baseLoadedMixin(Base) {
  get linkTarget() { return this._props.linkTarget }

  get linkEndTarget() { return this._props.linkEndTarget }
}

export class Directory extends baseLoadedMixin(directoryMixin(FsObjectCommon)) {
  toJSON(pathOnly = false, expandContent = true) {
    return super.toJSON(pathOnly, expandContent)
  }

  get loadedSize() { return this._props.loadedSize }
}
export class File extends baseLoadedMixin(fileMixin(FsObjectCommon)) {
  toJSON(pathOnly = false) {
    return super.toJSON(pathOnly, false)
  }
}
export class BlockDevice extends File {
  get type() { return FILE_TYPE_ENUMS.blockDevice }
}
export class CharacterDevice extends File {
  get type() { return FILE_TYPE_ENUMS.characterDevice }
}
export class LocalSocket extends File {
  get type() { return FILE_TYPE_ENUMS.localSocket }
}
export class NamedPipe extends File {
  get type() { return FILE_TYPE_ENUMS.namedPipe }
}
export class Symlink extends symLinkLoadedMixin(directoryMixin(fileMixin(symlinkMixin(FsObjectCommon)))) {
  get type() { return FILE_TYPE_ENUMS.symbolicLink }

  toJSON(pathOnly = false, expandContent = true) {
    const json = super.toJSON(pathOnly, expandContent)
    Object.assign(json, {
      linkEndTarget: this.linkEndTarget.toJSON(),
      linkTarget: this.linkTarget.toJSON(),
    })
    return json
  }
}
