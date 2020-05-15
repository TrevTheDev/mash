/* eslint-disable no-param-reassign */
import fs, {promises as fsPromises} from 'fs'
// import deasync from 'deasync'
import {propertiesThatRequireStat} from './init.js'
import chmod from '../../parsers/chmod.js'
import chown from '../../parsers/chown.js'
import rm from '../../parsers/rm.js'
import touch from '../../parsers/touch.js'
import mkdir from '../../parsers/mkdir.js'
import matchAttrs from '../../parsers/matchAttrs.js'
import mv from '../../parsers/mv.js'
import populateDirectory from '../../parsers/populate/populateDirectory.js'
import populateFSObject from '../../parsers/populate/populateFSObject.js'
import chgrp from '../../parsers/chgrp.js'
import ln from '../../parsers/ln.js'
import cat from '../../parsers/cat.js'
import write from '../../parsers/write.js'
import gioTrash from '../../parsers/gio trash.js'
import {Path} from '../path.js'
import CopyManager from '../../parsers/copy/copy manager.js'
import cd from '../../parsers/cd.js'
import FindBuilder from './find builder.js'
// import {ChainablePromise} from '../../util/utils'

const shared = Object.getOwnPropertyDescriptors({
  stat(gio = true, lsattr = true, size = false) {
    return populateFSObject(this, gio, lsattr, size)
  },

  get parent() {
    if (this._pvt.parent) return this._pvt.parent
    const {parentPath} = this.path
    return this.path.isRoot || !parentPath
      ? undefined
      : this.executionContext.getDirectoryFromPath(parentPath)
  },

  u(path) {
    return this.executionContext.getFsObjectFromPath(
      `${this.path.addSegment(path)}`
    )
  },

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

  cloneAttrs(sourceFSObject) {
    return matchAttrs(this, sourceFSObject)
  },

  rename(newName) {
    return mv(this, newName)
  },

  touch() {
    return touch(this)
  },

  trash() {
    return gioTrash(this)
  },

  get size() {
    // TODO: Test
    return new Promise(async resolve => {
      await this.stat(this.loadedGio || true, this.loadedLsattr || true, true)
      resolve(this.size)
    })
  }
})
const directory = Object.getOwnPropertyDescriptors({
  /**
   * Creates new Directory(s) - mkdir
   * usage Directory.addDirectory('newDirName')
   * translates an array of strings into a directory tree
   * ['A1','A2','A3] will result in a directories as follows: path+/A1/A2/A3
   * [['A1'],['A2'],['A3'] will result in a directories of path+/A1
   *                                                       path+/A2
   *                                                       path+/A3
   * [['A1','B1','B2'],['A2'],['A3'] will result in path+/A1/B1/B2
   *                                                path+/A2
   *                                                path+/A3
   * TODO: consider accepting arrays for permissions, owner and group
   * @param {String | Path } nameArr name(s) of new directories to create
   * @param {boolean} [ignoreAnyExistingDirectories=false] ignore any existing directories or no
   * @returns DirectoryProxy or Array of DirectoryProxies
   */
  async addDirectory(nameArr, ignoreAnyExistingDirectories = false) {
    let nameArrMod
    if (nameArr.constructor.name === 'String')
      nameArrMod = new Path(nameArr).toArray()
    else if (nameArr.constructor.name === 'Path') nameArrMod = nameArr.toArray()
    else if (nameArr.constructor.name !== 'Array')
      throw new Error('invalid directory name(s)')
    else nameArrMod = nameArr

    const newDirs = await mkdir(this, nameArrMod, ignoreAnyExistingDirectories)
    return newDirs.length === 1 ? newDirs[0] : newDirs
  },

  async addFile(name, content = '', overwrite = false) {
    const newFile = await this.u(name)
    await newFile.write(content, overwrite)
    return newFile
  },

  /**
   * Deleted directory - rm
   * usage Directory.delete(true)
   * TODO: test limitToThisDirsFileSystem
   * @param {boolean} [recursive=false] deletes all content recursively
   * @param {boolean} [limitToThisDirsFileSystem=false] limit delete to the fs on which the directory is
   * @param {boolean} [onlyIfExists=false] confirms if file exists before trying to delete
   * @returns true if directory deleted, or throws if not.
   */
  delete(
    recursive = false,
    limitToThisDirsFileSystem = false,
    onlyIfExists = false
  ) {
    return rm(this, recursive, limitToThisDirsFileSystem, onlyIfExists)
  },

  async dir(gio = true, lsattr = true, size = false, recursively = false) {
    this._pvt.content = await populateDirectory(this, gio, lsattr, size)
    if (recursively) await this._pvt.content.loadAll(gio, lsattr, size)
    return this.content
  },

  get content() {
    if (this._pvt.content) return this._pvt.content
    return this.dir()
  },

  cd() {
    return cd(this)
  },

  get find() {
    return new FindBuilder(this)
  },

  setPermissions(permissions, applyRecursively = false) {
    return chmod(this, permissions, applyRecursively)
  },

  setUser(user, group, applyRecursively = false) {
    if (user) return chown(this, user, group, applyRecursively)
    return this.setGroup(group, applyRecursively)
  },

  setGroup(group, applyRecursively = false) {
    return chgrp(this, `${group}`, applyRecursively)
  }
})

const file = Object.getOwnPropertyDescriptors({
  delete(onlyIfExists = false) {
    return rm(this, false, false, onlyIfExists)
  },

  read() {
    return cat(this)
  },

  write(content, overwrite = false) {
    return write(this, content, overwrite)
  },

  append(content, encoding = 'utf8', mode) {
    return fsPromises.appendFile(`${this}`, content, {encoding, mode})
  },

  readChunk(startPosition, numberOfBytes, encoding = 'utf8') {
    return new Promise((resolve, reject) => {
      fs.open(`${this}`, 'r', (error, fd) => {
        if (error) throw error
        const buffer = Buffer.alloc(numberOfBytes)
        fs.read(
          fd,
          buffer,
          0,
          numberOfBytes,
          startPosition,
          (readError, bytesRead, readBuffer) => {
            if (readError) reject(readError)
            resolve(readBuffer.toString(encoding))
          }
        )
      })
    })
  },

  writeChunk(chunk, startPosition, encoding = 'utf8') {
    return new Promise((resolve, reject) => {
      fs.open(`${this}`, 'r+', (error, fd) => {
        if (error) throw error
        fs.write(fd, chunk, startPosition, encoding, (
          writeError /* , bytesWritten, string */
        ) => {
          if (writeError) reject(writeError)
          resolve(true)
        })
      })
    })
  },

  setPermissions(permissions) {
    return chmod(this, permissions, false)
  },

  setUser(user, group) {
    if (user) return chown(this, user, group, false)
    return this.setGroup(group)
  },

  setGroup(group) {
    return chgrp(this, `${group}`)
  }
})

const symlink = Object.getOwnPropertyDescriptors({
  linkTo(destination) {
    return ln(this, new Path(`${destination}`))
  }
})

export const loadableMixins = {
  FsObject: {...shared, ...file, ...directory, ...symlink},
  Directory: {...shared, ...directory},
  File: {...shared, ...file},
  Symlink: {...shared, ...file, ...directory, ...symlink},
  CharacterDevice: {...shared, ...file},
  BlockDevice: {...shared, ...file},
  LocalSocket: {...shared, ...file},
  NamedPipe: {...shared, ...file}
}

export default {
  allowedEnterStates: ['init'],
  enter(target) {
    Object.defineProperties(target, loadableMixins[target.constructor.name])
    if (target._createAutomationFunctions) {
      let i = 0
      const stat = async () => {
        i += 1
        if (target.state !== 'loadable') return // assume stated if state has changed
        if (!target._statPromise) target._statPromise = target.stat()
        await target._statPromise
        i -= 1
        if (i === 0) target._statPromise = undefined
      }
      propertiesThatRequireStat[target.constructor.name].forEach(prop => {
        Object.defineProperty(target, prop, {
          configurable: true,
          enumerable: true,
          get: () => {
            // let obj
            // let y = 0
            // try {
            //   const pms = new Promise(async resolve => {
            //     const bj = await target.stat()
            //     resolve(bj)
            //   })
            //   pms.then(outcome => {
            //     obj = outcome
            //   })
            // } catch (e) {
            //   obj = false
            // }
            // deasync.loopWhile(() => {
            //   y += 1
            //   console.log(`load - ${prop} - ${i}:${target}: ${target.state}`)
            //   return obj === undefined && target.state === 'loadable' && y < 10
            // })
            // return target[prop]

            return new Promise(resolve => {
              // console.log(`loadable: stat: ${target}: ${target.state}: ${prop}`)
              ;(async () => {
                await stat()
                resolve(target[prop])
              })()
            })
          }
        })
      })
    }
    return true
  },
  exit(target) {
    Object.keys(loadableMixins[target.constructor.name]).forEach(
      key => delete target[key]
    )
    if (target._createAutomationFunctions)
      propertiesThatRequireStat[target.constructor.name].forEach(
        prop => delete target[prop]
      )
  }
}
