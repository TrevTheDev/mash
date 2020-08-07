import EventEmitter from 'events'
import {
  populateFsObject, matchAttrs, mv, touch, gioTrash, CopyManager,
} from '../../parsers/cmds.js'

export default class FsObjectCommon extends EventEmitter {
  /**
   * @param {ExecutionContext} executionContext
   * @param {PathContainer} paths
   */
  constructor(executionContext, paths) {
    super()
    this._paths = paths
    this._executionContext = executionContext
    this._pvt = {}
  }

  /**
   * @param {string} command
   * @param {Object} doneCBPayload
   * @param {function} doneCallback
   * @param {boolean} sendToEveryShell
   * @returns {CommandIFace}
   */
  sh(command, doneCBPayload = undefined, doneCallback = undefined, sendToEveryShell = undefined) {
    return this.executionContext.sh(command, doneCBPayload, doneCallback, sendToEveryShell)
  }

  /**
   * @returns {PathContainer}
   */
  get paths() {
    return this._paths
  }

  /**
   * @returns {Path}
   */
  get path() {
    return this.paths.path
  }

  /**
   * @returns {FsObject}
   */
  get parent() {
    if (this._pvt.parent) return this._pvt.parent
    const { parentPath } = this.path
    return this.path.isRoot || !parentPath
      ? undefined
      : this.executionContext.getFsObject(`${parentPath}`)
  }

  /**
   * @returns {Promise}
   */
  get exists() {
    return this.paths.exists()
  }

  /**
   * @returns {ExecutionContext}
   */
  get executionContext() {
    return this._executionContext
  }

  /**
   * @returns {String}
   */
  toString() {
    return this.path.toString()
  }

  /**
   * @returns {object}
   */
  toJSON(pathOnly = true, expandContent = false) {
    const json = { path: this.path.toJSON() }
    if (pathOnly) return json

    if (this.loadedStat) {
      Object.assign(json, {
        blocksAllocated: this.blocksAllocated,
        deviceNumber: this.deviceNumber,
        type: this.type,
        numberHardLinks: this.numberHardLinks,
        inode: this.inode,
        majorDeviceType: this.majorDeviceType,
        minorDeviceType: this.minorDeviceType,
        timeOfBirth: this.timeOfBirth,
        timeOfLastAccess: this.timeOfLastAccess,
        timeOfLastModification: this.timeOfLastModification,
        timeOfLastMetaDataChange: this.timeOfLastMetaDataChange,

        permissions: this.permissions.toJSON(),
        loadedStat: true,
      // group: this.group.toJSON(),
      // user: this.user.toJSON(),
      // accessRights: this.accessRights,
      })
    }
    json.size = (this.loadedSize) ? this.size.toJSON() : this.size
    if (this.loadedSize) json.loadedSize = true
    if (this.loadedGio) {
      Object.assign(json, {
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
        loadedGio: true,
      })
    }
    if (this.loadedLsattr) {
      Object.assign(json, {
        lsattr: this.lsattr.toJSON(),
        loadedLsattr: true,
      })
    }
    if (expandContent) if (this.loadedContent) json.content = this._pvt.content.toJSON(pathOnly, expandContent)
    return json
  }

  /**
   * @returns {String}
   */
  toSh() {
    return this.path.toSh()
  }

  /**
   * @returns {FsObjectCommon}
   */
  markAsInvalid() {
    if (this._props) this.outdated = true
    return this
  }

  /**
   * @returns {FsObject}
   */
  u(path) {
    return this.executionContext.getFsObject(`${this.path.addSegment(path)}`)
  }

  /**
   * @param {boolean} gio
   * @param {boolean} lsattr
   * @param {boolean} size
   * @returns {Promise}
   */
  async stat(gio = true, lsattr = true, size = false) {
    await this._canonisePath()
    return populateFsObject(this, gio, lsattr, size)
  }

  /**
   * @param {Directory} destinationDirectory
   * @param {CP_TYPE} copyType
   * @param {boolean} confirmOverwriteCallBack
   * @returns {CopyManager}
   */
  copyTo(destinationDirectory, copyType, confirmOverwriteCallBack) {
    return new CopyManager(
      this,
      destinationDirectory,
      copyType,
      confirmOverwriteCallBack,
    )
  }

  /**
   * @param {Directory} destinationDirectory
   * @param {CP_TYPE} copyType
   * @param {boolean} confirmOverwriteCallBack
   * @returns {CopyManager}
   */
  moveTo(destinationDirectory, copyType, confirmOverwriteCallBack) {
    return new CopyManager(
      this,
      destinationDirectory,
      copyType,
      confirmOverwriteCallBack,
      true,
    )
  }

  /**
   * @param {FsObjectCommon} sourceFSObject
   * @returns {FsObjectCommon}
   */
  async cloneAttrs(sourceFSObject) {
    await this._canonisePath()
    return matchAttrs(this, sourceFSObject)
  }

  /**
   * @param {string} newName
   * @returns {FsObjectCommon}
   */
  async rename(newName) {
    await this._canonisePath()
    return mv(this, newName)
  }

  /**
   * @returns {FsObjectCommon}
   */
  async touch() {
    await this._canonisePath()
    return touch(this)
  }

  /**
   * @returns {boolean}
   */
  async trash() {
    await this._canonisePath()
    return gioTrash(this)
  }

  /**
   * @returns {FsObjectCommon}
   */
  async _canonisePath() {
    if (!this.paths.canonised) await this.paths.canoniseRequestPath()
    this.then = undefined
    return this
  }
}
