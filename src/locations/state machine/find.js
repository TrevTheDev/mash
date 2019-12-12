import stringToSize from '../../formatters/string to size'
import Size from '../../formatters/size'
import find from '../../parsers/find'
import {FILE_TYPE_ENUMS} from '../../util/globals'
import {isNumber} from '../../util/utils'

const convertFileEnumToType = fileEnum => {
  const types = ['f', 'd', 'l', 'c', 'b', 's', 'p']
  return types[fileEnum.index]
}

const DEFAULT_OPTIONS = {
  name: undefined, // string
  regex: undefined,
  caseInsensitive: false,
  ext: undefined,
  lastAccessedMinutesAgo: undefined,
  metaDataLastModifiedMinutesAgo: undefined,
  contentLastModifiedMinutesAgo: undefined,
  onlyIfEmptyFileOrDir: false,
  isExecutable: false,
  isReadable: false,
  isWritable: false,
  gid: undefined,
  group: undefined,
  hasNoGroup: false,
  uid: undefined,
  user: undefined,
  hasNoUser: false,
  inodeNumber: undefined,
  atLeastMatchPermissions: undefined,
  biggerThan: undefined,
  smallerThan: undefined,
  type: undefined,
  maxDepthToSearch: undefined
}

export default class FindBuilder {
  constructor(fsObject) {
    this._fsObject = fsObject
    this._setOptions = undefined
  }

  set _setOptions(options = DEFAULT_OPTIONS) {
    this._options = options
  }

  byName(name) {
    this._options.name = name
    return this
  }

  byRegEx(regex) {
    this._options.regex = regex
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

  byExt(ext) {
    this._options.ext = ext
    return this
  }

  biggerThan(size) {
    let sz = size
    if (size.constructor.name === 'string') sz = stringToSize(size)
    else if (isNumber(size)) sz = new Size(size)
    if (sz.constructor.name !== 'size')
      throw new Error('biggerThan: invalid size')
    this._options.biggerThan = sz
    return this
  }

  smallerThan(size) {
    let sz = size
    if (size.constructor.name === 'string') sz = stringToSize(size)
    else if (isNumber(size)) sz = new Size(size)
    if (sz.constructor.name !== 'size')
      throw new Error('biggerThan: invalid size')
    this._options.smallerThan = sz
    return this
  }

  byModifiedMinutesAgo(minutes) {
    this._options.contentLastModifiedMinutesAgo = minutes
    return this
  }

  beEmpty() {
    this._options.onlyIfEmptyFileOrDir = true
    return this
  }

  hasNoUser() {
    this._options.hasNoUser = true
    return this
  }

  hasNoGroup() {
    this._options.hasNoUser = true
    return this
  }

  byInode(inodeNumber) {
    this._options.inodeNumber = inodeNumber
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

  byUser(user) {
    this._options.user = user
    return this
  }

  byUID(uid) {
    this._options.uid = uid
    return this
  }

  doNotSearchSubDirectories() {
    this._options.maxDepthToSearch = 1
    return this
  }

  execute() {
    return find(this._fsObject, this.toString())
  }

  executeOptions(options) {
    this._setOptions = {...DEFAULT_OPTIONS, ...options}
    this.execute()
  }

  toString() {
    const search = this._options
    let findStr = `find ${this._fsObject.toSh()} -print0`
    if (search.name)
      if (search.caseInsensitive) findStr += ` -iname '${search.name}'`
      else findStr += ` -name '${search.name}'`
    if (search.regex)
      if (search.caseInsensitive) findStr += ` -iregex '${search.regex}'`
      else findStr += ` -regex '${search.regex}'`
    if (search.lastAccessedMinutesAgo)
      findStr += ` -amin '${search.lastAccessedMinutesAgo}'`
    if (search.metaDataLastModifiedMinutesAgo)
      findStr += ` -cmin '${search.metaDataLastModifiedMinutesAgo}'`
    if (search.contentLastModifiedMinutesAgo)
      findStr += ` -mmin '${search.contentLastModifiedMinutesAgo}'`
    if (search.onlyIfEmptyFileOrDir) findStr += ` -empty`
    if (search.isExecutable) findStr += ` -executable`
    if (search.isReadable) findStr += ` -readable`
    if (search.isWritable) findStr += ` -writable`
    if (search.gid) findStr += ` -gid ${search.gid}`
    if (search.group) findStr += ` -group ${search.group}`
    if (search.hasNoGroup) findStr += ` -nogroup`
    if (search.uid) findStr += ` -uid ${search.uid}`
    if (search.user) findStr += ` -user ${search.user}`
    if (search.hasNoUser) findStr += ` -nouser`
    if (search.inodeNumber) findStr += ` -inum ${search.inodeNumber}'`
    if (search.atLeastMatchPermissions)
      findStr += ` -perm -${search.atLeastMatchPermissions}`
    if (search.biggerThan) findStr += ` -size +${search.biggerThan}` // TODO: sizes
    if (search.smallerThan) findStr += ` -size -${search.smallerThan}`
    if (search.type) findStr += ` -type ${convertFileEnumToType(search.type)}`
    if (search.maxDepthToSearch)
      findStr += ` -maxdepth ${search.maxDepthToSearch}`
    return findStr
  }
}
