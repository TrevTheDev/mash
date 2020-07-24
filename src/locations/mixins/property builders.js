const customStatMixin = `
  get loaded() {
    return true
  }

  get group() {
    return this.permissions.group
  }

  get user() {
    return this.permissions.user
  }

  get accessRights() {
    return this.permissions.octal
  }

  toJSON(pathOnly = false, expandContent = true) {
    if (pathOnly) return this.path.toString()

    const json = {
      path: this.path.toJSON(),
      blocksAllocated: this.blocksAllocated,
      // accessRights: this.accessRights,
      deviceNumber: this.deviceNumber,
      type: this.type,
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
      size: this.size,
      loadedGio: this.loadedGio,
      loadedStat: this.loadedStat,
      loadedLsattr: this.loadedLsattr,
      permissions: this.permissions.toJSON(),
    }
    if (this.lsattr) json.lsattr = this.lsattr.toJSON()
    if (expandContent && this._content)
      json.content = this._content.toJSON(pathOnly, expandContent)
    return json
  }
`

const listOfCommonStatProperties = [
  'permissions',
  'group',
  'user',
  'accessRights',
  'size',
  'blocksAllocated',
  'deviceNumber',
  'numberHardLinks',
  'inode',
  'majorDeviceType',
  'minorDeviceType',
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
]

const listOfSymlinkProperties = [
  'linkTarget',
  'linkEndTarget',
]

const buildStatPromiseGetter = (properties) => properties.map((property) => `
get ${property}() {
  return new Promise((result) => {
    (async () => {
      const fsObject = await this.stat()
      result(fsObject.${property})
    })()
  })
}`)

export const baseStatPropertyPromises = buildStatPromiseGetter([...listOfCommonStatProperties, 'type']).join('')

export const symlinkStatPropertyPromises = buildStatPromiseGetter(listOfSymlinkProperties).join('')

const listOfFunctions = [
  'addDirectory',
  'addFile',
  'dir',
  'cd',
  'read',
  'readStream',
  'write',
  'writeStream',
  'append',
  'readChunk',
  'writeChunk',

  'delete',

  'setPermissions',
  'setUser',
  'setGroup',
  'u',
  'stat',
  'copyTo',
  'moveTo',
  'cloneAttrs',
  'rename',
  'touch',
  'trash',
  'linkTo',
]

export const promiseFunctions = listOfFunctions.map((fnName) => `
${fnName}(...args) {
  return new Promise((result) => {
    (async () => {
      const fsObject = await this
      result(fsObject.${fnName}(...args))
    })()
  })
}`).join('')

const buildPromisePropertyGetter = (properties) => properties.map((property) => `
get ${property}() {
  return new Promise((result) => {
    (async () => {
      const fsObject = await this
      result(fsObject.${property})
    })()
  })
}`)

export const promiseProperties = buildPromisePropertyGetter([
  ...listOfCommonStatProperties,
  ...listOfSymlinkProperties,
  'type',
  'content',
]).join('')

const buildStatProperties = (properties) => properties.map((property) => `
get ${property}() { return this._props.${property} }`)

export const baseStatProperties = [...buildStatProperties(listOfCommonStatProperties), customStatMixin].join('')

export const symlinkStatProperties = buildStatProperties(listOfSymlinkProperties).join('')
