import fs, { promises as fsPromises } from 'fs'

import { FILE_TYPE_ENUMS } from '../../util/globals.js'

import {
  cat, write, writeStream, chmod, chown, chgrp, rm,
} from '../../parsers/cmds.js'

const fileMixin = (Base) => class extends Base {
  /**
   * @returns {FILE_TYPE_ENUMS}
   */
  // eslint-disable-next-line class-methods-use-this
  get type() { return FILE_TYPE_ENUMS.file }

  /**
   * @returns {string} content of file
   */
  async read() {
    await this._canonisePath()
    return cat(this)
  }

  /**
   * @param { string | { flags?: string, encoding?: BufferEncoding, fd?: number, mode?: number, autoClose?: boolean, emitClose?: boolean, start?: number,
  end?: number, highWaterMark?: number } } options
   * @returns {NodeJS.ReadStream} readStream of file
   */
  async readStream(options) {
    await this._canonisePath()
    return fs.createReadStream(`${this}`, options)
  }

  /**
   * @param {string} content
   * @param {boolean} overwrite
   * @returns {File}
   */
  async write(content, overwrite = false) {
    await this._canonisePath()
    return write(this, content, overwrite)
  }

  /**
   * @param {NodeJS.ReadableStream} readableStream - stream to write to fs
   * @param {boolean} overwrite
   * @returns {NodeJS.WritableStream}
   */
  async writeStream(readableStream, overwrite = false) {
    await this._canonisePath()
    return writeStream(this, readableStream, overwrite)
  }

  /**
   * @param {string | Uint8Array} content
   * @param {BaseEncodingOptions & { mode?: Mode, flag?: OpenMode } | BufferEncoding | null} options?
   * @returns {Promise}
   */
  async append(content, options) {
    await this._canonisePath()
    return fsPromises.appendFile(`${this}`, content, options)
  }

  /**
   * @param {number} startPosition
   * @param {number} numberOfBytes
   * @param {"ascii" | "utf8" | "utf-8" | "utf16le" | "ucs2" | "ucs-2" | "base64" | "latin1" | "binary" | "hex" | undefined} encoding
   * @returns {string}
   */
  async readChunk(startPosition, numberOfBytes, encoding = 'utf8') {
    await this._canonisePath()
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

  /**
   * @param {string} chunk
   * @param {number} startPosition
   * @param {"ascii" | "utf8" | "utf-8" | "utf16le" | "ucs2" | "ucs-2" | "base64" | "latin1" | "binary" | "hex" | undefined} encoding
   * @returns {boolean}
   */
  async writeChunk(chunk, startPosition, encoding = 'utf8') {
    await this._canonisePath()
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

  /**
   * @param {string} permissions
   * @returns {File|FilePromise|FsObject}
   */
  async setPermissions(permissions) {
    await this._canonisePath()
    return chmod(this, permissions, false)
  }

  /**
   * @param {User|string} user
   * @param {Group|string} group
   * @returns {File|FilePromise|FsObject}
   */
  async setUser(user = undefined, group = undefined) {
    if (!user) return this.setGroup(group)
    await this._canonisePath()
    return chown(this, user, group, false)
  }

  /**
   * @param {Group|string} group
   * @returns {File|FilePromise|FsObject}
   */
  async setGroup(group) {
    await this._canonisePath()
    return chgrp(this, `${group}`, false)
  }

  /**
   * @param {boolean} onlyIfExists
   * @returns {boolean}
   */
  async delete(onlyIfExists = false) {
    await this._canonisePath()
    return rm(this, false, false, onlyIfExists)
  }
}

export default fileMixin
