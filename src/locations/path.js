/* eslint-disable no-param-reassign, max-classes-per-file */
import path from 'path'
import { pathExists, canonisePath, symlinkTarget } from '../parsers/realpath.js'
import { LOCAL } from '../util/globals.js'

/**
 * @param {string} uri
 * @return {string}
 */
const uriToPathString = (uri) => {
  if (!/^file:\/\/(\w|\/|\.|-| )+/.test(uri) || /\.\.|\/\./.test(uri)) throw new Error(`${LOCAL.invalidFileURI}: ${path}`)

  const rest = decodeURI(uri.substring(7))
  const firstSlash = rest.indexOf('/')
  let host = rest.substring(0, firstSlash)
  let tmpPath = rest.substring(firstSlash + 1)
  // remove any 'localhost'.
  if (['localhost', '127.0.0.1', '0.0.0.0'].includes(host.toLowerCase())) host = path.sep
  if (host !== path.sep) host = `${path.sep}${path.sep}${host}`
  tmpPath = tmpPath.replace(/^(.+)\|/, '$1:')
  if (path.sep === '\\') tmpPath = tmpPath.replace(/\//g, '\\') // for Windows: invert the path separators
  if (/^.+\\:/.test(tmpPath)) throw new Error('to be completed')

  return `${host}${path.sep}${tmpPath}`
}

export class Path {
  /**
   * @param {string} pathString
   */
  constructor(pathString) {
    if (!pathString) throw new Error('pathString must be defined and may not be an empty string')

    this._inputPath = pathString
    const dUri = decodeURIComponent(pathString)
    if (/^file:\/\/(\w|\/|\.|-| )+/.test(dUri)) pathString = uriToPathString(dUri)
    this._path = path.parse(path.normalize(pathString))
  }

  /**
   * @return {Path|undefined}
   */
  get root() {
    return this._path.root ? new Path(this._path.root) : undefined
  }

  /**
   * @return {boolean}
   */
  get isRoot() {
    return this.isAbsolute ? this.root.pathString === this.pathString : false
  }

  /**
   * @return {string}
   */
  get ext() {
    return this._path.ext
  }

  /**
   * @return {string}
   */
  get base() {
    return this._path.base
  }

  /**
   * @return {string}
   */
  get name() {
    return this._path.name
  }

  /**
   * @return {string}
   */
  get pathString() {
    return `${this.isAbsolute ? '' : ''}${path.format(this._path)}`
  }

  /**
   * @return {boolean}
   */
  get isAbsolute() {
    return this._path.root !== ''
  }

  /**
   * @return {Path|undefined}
   */
  get parentPath() {
    return this._path.dir === '' ? undefined : new Path(this._path.dir)
  }

  /**
   * @param {Path|string} segment
   * @return {Path}
   */
  addSegment(segment) {
    return new Path(path.join(`${this}`, `${segment}`))
  }

  /**
   * @return {boolean}
   */
  get isValid() {
    return this.toArray().every((name) => /^[\w\-. ]+$/.test(name))
  }

  /**
   * @return {string}
   */
  toString() {
    return this.pathString
  }

  /**
   * @return {Object}
   */
  toJSON() {
    return {
      path: this.pathString,
      name: this.name,
      base: this.base,
      root: this.root.pathString,
      // isValid: this.isValid,
      parentPath: this.parentPath.pathString,
      ext: this.ext,
    }
  }

  /**
   * @return {string}
   */
  toSh() {
    return `"$(cat<<'+++EOF+++'\n${this}\n+++EOF+++\n)"`
  }

  /**
   * @return {Array}
   */
  toArray() {
    return this.pathString.split(path.sep).filter((name) => name !== '')
  }
}
export class PathContainer {
  /**
   * @param {ExecutionContext} executionContext
   * @param {string} requestedPath
   * @param {string} statPath
   */
  constructor(executionContext, requestedPath = undefined, statPath = undefined) {
    this._executionContext = executionContext
    if (requestedPath) this._requestedPath = new Path(requestedPath)
    if (statPath) this._setStatPath(statPath)
  }

  /**
   * @return {Path}
   */
  get requestedPath() {
    return this._requestedPath
  }

  /**
   * @return {Path}
   */
  get canonizedPath() {
    return this._canonizedPath
  }

  /**
   * @return {Path}
   */
  get statPath() {
    return this._statPath
  }

  /**
   * @return {Promise}
   */
  async canonizeRequestPath() {
    this._canonizedPath = new Path(await canonisePath(this._executionContext, this.requestedPath))
    return this.canonizedPath
  }

  /**
   * @return {Promise}
   */
  async exists() {
    const result = await pathExists(this._executionContext, this.path)
    return !(result === false)
  }

  /**
   * @param {string} value
   */
  _setStatPath(value) {
    this._statPath = new Path(value)
  }

  /**
   * @return {Path}
   */
  get symlinkTargetPath() {
    return this._symlinkTargetPath
  }

  /**
   * @return {Path}
   */
  _setSymlinkTargetPath(value) {
    this._symlinkTargetPath = new Path(value)
  }

  /**
   * @return {Promise}
   */
  async getSymlinkTargetPath() {
    this._symlinkTargetPath = undefined
    const res = await symlinkTarget(this._executionContext, this.path)
    if (res !== false) this._setSymlinkTargetPath(res)
    return this.symlinkTargetPath
  }

  /**
   * @return {Path}
   */
  get path() {
    return (
      this.statPath
      || this.canonizedPath
      || this.requestedPath
      || new Error('path not found')
    )
  }

  /**
   * @return {string}
   */
  toString() {
    return this.path.toString()
  }
}
/**
 * @param {string|Path} pathToNormalise
 * @return {Path}
 */
export const pathNormaliser = (pathToNormalise) => (pathToNormalise.constructor.name !== 'Path'
  ? new Path(`${pathToNormalise}`)
  : pathToNormalise)
