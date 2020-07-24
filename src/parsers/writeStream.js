import fs from 'fs'
import { LOCAL } from '../util/globals.js'

export const writeStream = async (fsObject, readableStream, overwrite) => {
  if ((await fsObject.exists) && !overwrite) throw new Error(`write: ${LOCAL.fsObjAlreadyExists}: ${fsObject}`)

  const wStream = fs.createWriteStream(`${fsObject}`)
  readableStream.pipe(wStream)

  return new Promise((success, fail) => {
    readableStream.once('end', () => {
      fsObject.markAsInvalid()
      success(fsObject.executionContext.getFilePathed(`${fsObject}`))
    })
    wStream.once('error', (err) => fail(err))
  })
}
