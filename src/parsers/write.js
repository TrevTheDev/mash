import { promises as fsPromises } from 'fs'
import path from 'path'
import crypto from 'crypto'
import os from 'os'
import { LOCAL, glob } from '../util/globals.js'

const write = async (fsObject, content, overwrite) => {
  if ((await fsObject.exists) && !overwrite) throw new Error(`write: ${LOCAL.fsObjAlreadyExists}: ${fsObject}`)
  const tmpPath = path.join(
    os.tmpdir(),
    `.mash.tmp.${Date.now()}.${crypto.randomBytes(8).toString('hex')}`,
  )

  await fsPromises.writeFile(tmpPath, content)

  const writeSh = await fsObject.sh(
    `cp --no-preserve=mode,ownership${
      overwrite ? '' : ' -n'
    } ${tmpPath} ${fsObject.toSh()};`,
  )
  await fsPromises.unlink(tmpPath)

  if (writeSh.error) {
    let msg
    if (writeSh.output.includes('Permission denied')) msg = `write: ${LOCAL.permissionDenied}: ${fsObject}`
    else msg = `write: ${writeSh.output}: ${fsObject}`
    if (glob.logger) glob.logger.error(msg, 'write')
    throw new Error(msg)
  }
  if (fsObject.state === 'loaded') fsObject._transitionState('outdated')

  return fsObject.executionContext.getFileFromPath(`${fsObject}`)
}
export default write
