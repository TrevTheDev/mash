/* eslint-disable no-param-reassign */
import path from 'path'
import {pathExists, canonisePath, symlinkTarget} from '../parsers/realpath'
import {LOCAL} from '../util/globals'

const uriToPathString = uri => {
  if (!/^file:\/\/(\w|\/|\.|-| )+/.test(uri) || /\.\.|\/\./.test(uri)) {
    throw new Error(`${LOCAL.invalidFileURI}: ${path}`)
  }
  const rest = decodeURI(uri.substring(7))
  const firstSlash = rest.indexOf('/')
  let host = rest.substring(0, firstSlash)
  let tmpPath = rest.substring(firstSlash + 1)
  // remove any 'localhost'.
  if (['localhost', '127.0.0.1', '0.0.0.0'].includes(host.toLowerCase()))
    host = path.sep
  if (host !== path.sep) host = `${path.sep}${path.sep}${host}`
  tmpPath = tmpPath.replace(/^(.+)\|/, '$1:')
  if (path.sep === '\\') tmpPath = tmpPath.replace(/\//g, '\\') // for Windows: invert the path separators
  if (/^.+\\:/.test(tmpPath)) throw new Error('to be completed')

  return `${host}${path.sep}${tmpPath}`
}

export class Path {
  constructor(pathString) {
    if (!pathString)
      throw new Error(
        'pathString must be defined and may not be an empty string'
      )
    this._inputPath = pathString
    const dUri = decodeURIComponent(pathString)
    if (/^file:\/\/(\w|\/|\.|-| )+/.test(dUri))
      pathString = uriToPathString(dUri)
    this._path = path.parse(path.normalize(pathString))
  }

  get root() {
    return this._path.root ? new Path(this._path.root) : undefined
  }

  get isRoot() {
    return this.isAbsolute ? this.root.pathString === this.pathString : false
  }

  get ext() {
    return this._path.ext
  }

  get base() {
    return this._path.base
  }

  get name() {
    return this._path.name
  }

  get pathString() {
    return `${this.isAbsolute ? '' : ''}${path.format(this._path)}`
  }

  get isAbsolute() {
    return this._path.root !== ''
  }

  get parentPath() {
    return this._path.dir === '' ? undefined : new Path(this._path.dir)
  }

  addSegment(segment) {
    return new Path(path.join(`${this}`, `${segment}`))
  }

  get toArray() {
    return this.pathString.split(path.sep).filter(name => name !== '')
  }

  get isValid() {
    return this.toArray.every(name => {
      return /^[\w\-. ]+$/.test(name)
    })
  }

  toString() {
    return this.pathString
  }

  toJSON() {
    return {
      path: this.pathString,
      name: this.name,
      base: this.base,
      root: this.root.pathString,
      // isValid: this.isValid,
      parentPath: this.parentPath.pathString,
      ext: this.ext
    }
  }

  toSh() {
    return `"$(cat<<'+++EOF+++'\n${this}\n+++EOF+++\n)"`
  }
}
export class PathContainer {
  constructor(fsObject, requestedPath, statPath) {
    this._fsObject = fsObject
    if (requestedPath) this._setRequestedPath(requestedPath)
    if (statPath) this._statPath(statPath)
  }

  get requestedPath() {
    return this._requestedPath
  }

  _setRequestedPath(value) {
    this._requestedPath = new Path(value)
  }

  get canonizedPath() {
    return this._canonizedPath
  }

  _setCanonizedPath(value) {
    this._canonizedPath = new Path(value)
  }

  async canonize(checkExistence = false) {
    this._exists = undefined
    const res = checkExistence
      ? await pathExists(this._fsObject.executionContext, this.requestedPath)
      : await canonisePath(this._fsObject.executionContext, this.requestedPath)

    if (res !== false) this._setCanonizedPath(res)
    if (checkExistence) this._exists = res !== false
    return this.canonizedPath
  }

  get statPath() {
    return this._statPath
  }

  _setStatPath(value) {
    this._statPath = new Path(value)
  }

  get symlinkTargetPath() {
    return this._symlinkTargetPath
  }

  _setSymlinkTargetPath(value) {
    this._symlinkTargetPath = new Path(value)
  }

  async getSymlinkTargetPath() {
    // this._linkExists = undefined
    this._symlinkTargetPath = undefined
    const res = await symlinkTarget(this._fsObject.executionContext, this.path)
    if (res !== false) this._setSymlinkTargetPath(res)
    // this._linkExists = res !== false
    return this.symlinkTargetPath
  }

  // get linkExists() {
  //   return this._symlinkTargetPath ? this._linkExists : undefined
  // }

  get path() {
    return (
      this.statPath ||
      this.canonizedPath ||
      this.requestedPath ||
      new Error('path not found')
    )
  }

  async exists(force = true) {
    if (force || this._exists === undefined) await this.canonize(true)
    return this._exists
  }

  toString() {
    return `${this.path}`
  }
}

export const pathNormaliser = pathToNormalise => {
  return pathToNormalise.constructor.name !== 'Path'
    ? new Path(`${pathToNormalise}`)
    : pathToNormalise
}
