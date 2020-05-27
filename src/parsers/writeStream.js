import fs from 'fs'
import { LOCAL } from '../util/globals.js'

const writeStream = async (fsObject, readableStream, overwrite) => {
  if ((await fsObject.exists) && !overwrite) throw new Error(`write: ${LOCAL.fsObjAlreadyExists}: ${fsObject}`)

  const wStream = fs.createWriteStream(`${fsObject}`)
  readableStream.pipe(wStream)

  return new Promise((success, fail) => {
    readableStream.once('end', () => {
      if (fsObject.state === 'loaded') fsObject._transitionState('outdated')
      success(fsObject.executionContext.getFileFromPath(`${fsObject}`))
    })
    wStream.once('error', (err) => fail(err))
  })
}
export default writeStream
