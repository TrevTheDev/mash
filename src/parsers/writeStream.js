import fs from 'fs'
import { LOCAL } from '../util/globals.js'

/**
 * @param {FsObjectCommon} fsObject
 * @param {NodeJS.ReadableStream} readableStream
 * @param {boolean} overwrite
 * @returns {File}
 */
export const writeStream = async (fsObject, readableStream, overwrite) => {
  if ((await fsObject.exists) && !overwrite) throw new Error(`write: ${LOCAL.fsObjAlreadyExists}: ${fsObject}`)

  const wStream = fs.createWriteStream(`${fsObject}`)
  readableStream.pipe(wStream)

  return new Promise((success, fail) => {
    readableStream.once('end', () => {
      fsObject.markAsInvalid()
      success(fsObject.executionContext.getFilePromise(`${fsObject}`))
    })
    wStream.once('error', (err) => fail(err))
  })
}
