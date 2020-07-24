import fs, { promises as fsPromises } from 'fs'

import { FILE_TYPE_ENUMS } from '../../util/globals.js'
import FsObjectCommon from './common.js'

import {
  cat, write, writeStream, chmod, chown, chgrp, rm,
} from '../../parsers/cmds.js'

function addStringToName(target, name, descriptor) {
  const fn = descriptor.value
  // saving a reference to our decorated method so we can use it later

  descriptor.value = (wrestler) => {
    fn.call(target, `${wrestler} is a wrestler`)
  }
  // replacing the decorated method (descriptor.value)
  // this new function executes our original function (fn), that's why we saved the reference
  // this new function adds some functionality (concatenating the string)
  // we do this using call(), because we want to apply the right context (target)
}

export default class FileBase extends FsObjectCommon {
  /**
   * @returns {Promise.<String>} content of file
   */

  // eslint-disable-next-line class-methods-use-this
  get type() { return FILE_TYPE_ENUMS.file }

  @addStringToName
  read() {
    return cat(this)
  }

  /**
   * @returns {ReadStream} content of file
   */
  readStream(options) {
    return fs.createReadStream(`${this}`, options)
  }

  /**
   * @param {String} content
   * @param {Boolean} overwrite
   * @returns {Promise<FilePathed>}
   */
  write(content, overwrite = false) {
    return write(this, content, overwrite)
  }

  /**
   * @param {Stream.Readable} readableStream - stream to write to fs
   * @param {Boolean} overwrite
   * @returns {Promise}
   */
  writeStream(readableStream, overwrite = false) {
    return writeStream(this, readableStream, overwrite)
  }

  append(content, encoding = 'utf8', mode) {
    return fsPromises.appendFile(`${this}`, content, { encoding, mode })
  }

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
          },
        )
      })
    })
  }

  writeChunk(chunk, startPosition, encoding = 'utf8') {
    return new Promise((resolve, reject) => {
      fs.open(`${this}`, 'r+', (error, fd) => {
        if (error) throw error
        fs.write(fd, chunk, startPosition, encoding, (
          writeError, /* , bytesWritten, string */
        ) => {
          if (writeError) reject(writeError)
          resolve(true)
        })
      })
    })
  }

  setPermissions(permissions) {
    return chmod(this, permissions, false)
  }

  setUser(user, group) {
    if (user) return chown(this, user, group, false)
    return this.setGroup(group)
  }

  setGroup(group) {
    return chgrp(this, `${group}`)
  }

  delete(onlyIfExists = false) {
    return rm(this, false, false, onlyIfExists)
  }
}
