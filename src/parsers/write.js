import {promises as fsPromises} from 'fs'
import path from 'path'
import crypto from 'crypto'
import os from 'os'
import {LOCAL, glob} from '../util/globals'

export default async (FSObject, content, overwrite) => {
  if ((await FSObject.exists) && !overwrite)
    throw new Error(`write: ${LOCAL.fsObjAlreadyExists}: ${FSObject}`)
  const tmpPath = path.join(
    os.tmpdir(),
    `.mash.tmp.${Date.now()}.${crypto.randomBytes(8).toString('hex')}`
  )

  await fsPromises.writeFile(tmpPath, content)

  const write = await FSObject.sh(
    `cp --no-preserve=mode,ownership${
      overwrite ? '' : ' -n'
    } ${tmpPath} ${FSObject.toSh()};`
  )
  await fsPromises.unlink(tmpPath)

  if (write.error) {
    let msg
    if (write.output.includes('Permission denied'))
      msg = `write: ${LOCAL.permissionDenied}: ${FSObject}`
    else msg = `write: ${write.output}: ${FSObject}`
    if (glob.logger) glob.logger.error(msg, 'write')
    throw new Error(msg)
  }
  if (FSObject.state === 'loaded') FSObject._transitionState('outdated')

  const newFile = FSObject.executionContext.getFileFromPath(`${FSObject}`)
  // Object.setPrototypeOf(newFile, new glob.File(newFile.executionContext))

  return newFile
}
