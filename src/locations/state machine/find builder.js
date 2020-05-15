import stringToSize from '../../formatters/string to size.js'
import Size from '../../formatters/size.js'
import find from '../../parsers/find.js'
import {FILE_TYPE_ENUMS} from '../../util/globals.js'
import {isNumber} from '../../util/utils.js'

const convertFileEnumToType = fileEnum =>
  ['f', 'd', 'l', 'c', 'b', 's', 'p'][fileEnum.index]

const DEFAULT_OPTIONS = {
  maxDepthToSearch: undefined,

  name: undefined, // string
  regex: undefined,
  caseInsensitive: false,
  inodeNumber: undefined,
  ext: undefined,

  type: undefined,

  biggerThan: undefined,
  smallerThan: undefined,
  onlyIfEmptyFileOrDir: false,

  contentLastModifiedMinutesAgo: undefined,
  lastAccessedMinutesAgo: undefined,
  metaDataLastModifiedMinutesAgo: undefined,

  group: undefined,
  gid: undefined,
  hasNoGroup: false,
  user: undefined,
  uid: undefined,
  hasNoUser: false,

  atLeastMatchPermissions: undefined,
  isExecutable: false,
  isReadable: false,
  isWritable: false
}

export default class FindBuilder {
  constructor(fsObject) {
    this._fsObject = fsObject
    this._setOptions()
  }

  _setOptions(options = {...DEFAULT_OPTIONS}) {
    this._options = options
  }

  byName(name) {
    this._options.name = name
    return this
  }

  byRegEx(regex) {
    this._options.regex = `.*/${regex}`
    return this
  }

  ignoreCase() {
    this._options.caseInsensitive = true
    return this
  }

  byInode(inodeNumber) {
    this._options.inodeNumber = inodeNumber
    return this
  }

  byExt(ext) {
    this._options.ext = ext
    return this
  }

  byType(type) {
    this._options.type = type
    return this
  }

  isDirectory() {
    this._options.type = FILE_TYPE_ENUMS.directory
    return this
  }

  isFile() {
    this._options.type = FILE_TYPE_ENUMS.file
    return this
  }

  isSymlink() {
    this._options.type = FILE_TYPE_ENUMS.symbolicLink
    return this
  }

  biggerThan(size) {
    let sz = size
    if (size.constructor.name === 'String') sz = stringToSize(size)
    else if (isNumber(size)) sz = new Size(size)
    if (sz.constructor.name !== 'Size')
      throw new Error('biggerThan: invalid size')
    this._options.biggerThan = sz
    return this
  }

  smallerThan(size) {
    let sz = size
    if (size.constructor.name === 'String') sz = stringToSize(size)
    else if (isNumber(size)) sz = new Size(size)
    if (sz.constructor.name !== 'Size')
      throw new Error('smallerThan: invalid size')
    this._options.smallerThan = sz
    return this
  }

  isEmpty() {
    this._options.onlyIfEmptyFileOrDir = true
    return this
  }

  modifiedWithin(minutes) {
    this._options.contentLastModifiedMinutesAgo = `-${minutes}`
    return this
  }

  modifiedAtLeast(minutes) {
    this._options.contentLastModifiedMinutesAgo = `+${minutes}`
    return this
  }

  accessedWithin(minutes) {
    this._options.lastAccessedMinutesAgo = `-${minutes}`
    return this
  }

  accessedAtLeast(minutes) {
    this._options.lastAccessedMinutesAgo = `+${minutes}`
    return this
  }

  metaDataModifiedWithin(minutes) {
    this._options.metaDataLastModifiedMinutesAgo = `-${minutes}`
    return this
  }

  metaDataModifiedAtLeast(minutes) {
    this._options.metaDataLastModifiedMinutesAgo = `+${minutes}`
    return this
  }

  byGroup(group) {
    this._options.group = group
    return this
  }

  byGID(gid) {
    this._options.gid = gid
    return this
  }

  hasNoGroup() {
    this._options.hasNoUser = true
    return this
  }

  byUser(user) {
    this._options.user = user
    return this
  }

  byUID(uid) {
    this._options.uid = uid
    return this
  }

  hasNoUser() {
    this._options.hasNoUser = true
    return this
  }

  ignoreSubdirectories() {
    this._options.maxDepthToSearch = 1
    return this
  }

  isExecutable() {
    this._options.isExecutable = true
    return this
  }

  isReadable() {
    this._options.isReadable = true
    return this
  }

  isWritable() {
    this._options.isWritable = true
    return this
  }

  async execute() {
    if (this._fsObject.state === 'init') await this._fsObject
    return find(this._fsObject, this.toString())
  }

  options(options) {
    this._setOptions({...this._options, ...options})
    return this
  }

  then(resolve) {
    resolve(this.execute())
  }

  toString() {
    const search = this._options
    let findStr = `find ${this._fsObject.toSh()}`
    let nameSearchString = ''
    if (search.maxDepthToSearch)
      findStr += ` -maxdepth ${search.maxDepthToSearch}`
    if (search.name) nameSearchString = `*${search.name}*`
    if (search.ext) {
      nameSearchString += search.name ? '' : '*'
      nameSearchString += `.${search.ext.split('.').join('')}`
    }
    if (nameSearchString !== '')
      findStr += ` -${
        search.caseInsensitive ? 'i' : ''
      }name '${nameSearchString}'`
    if (search.regex)
      findStr += ` -${search.caseInsensitive ? 'i' : ''}regex '${search.regex}'`
    if (search.inodeNumber) findStr += ` -inum ${search.inodeNumber}`

    if (search.type) findStr += ` -type ${convertFileEnumToType(search.type)}`

    if (search.biggerThan) findStr += ` -size +${search.biggerThan * 1}c` // TODO: sizes
    if (search.smallerThan) findStr += ` -size -${search.smallerThan * 1}c`
    if (search.onlyIfEmptyFileOrDir) findStr += ` -empty`

    if (search.lastAccessedMinutesAgo)
      findStr += ` -amin ${search.lastAccessedMinutesAgo}`
    if (search.metaDataLastModifiedMinutesAgo)
      findStr += ` -cmin ${search.metaDataLastModifiedMinutesAgo}`
    if (search.contentLastModifiedMinutesAgo)
      findStr += ` -mmin ${search.contentLastModifiedMinutesAgo}`

    if (search.group) findStr += ` -group '${search.group}'`
    if (search.gid) findStr += ` -gid ${search.gid}`
    if (search.hasNoGroup) findStr += ` -nogroup`
    if (search.user) findStr += ` -user '${search.user}'`
    if (search.uid) findStr += ` -uid ${search.uid}`
    if (search.hasNoUser) findStr += ` -nouser`

    if (search.isExecutable) findStr += ` -executable`
    if (search.isReadable) findStr += ` -readable`
    if (search.isWritable) findStr += ` -writable`
    if (search.atLeastMatchPermissions)
      findStr += ` -perm -${search.atLeastMatchPermissions}`

    return `${findStr} -print0;`
  }

  toJSON() {
    return this._options
  }
}
