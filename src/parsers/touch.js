/* eslint-disable no-await-in-loop */
/* eslint-disable no-param-reassign */
import { LOCAL, glob } from '../util/globals.js'

export const touch = async (fsObject) => {
  const cmd = await fsObject.sh(`touch -- ${fsObject.toSh()};`, 'touch')

  if (cmd.error) {
    let msg
    if (cmd.output.includes('Permission denied')) msg = `${LOCAL.permissionDenied}: touch: ${fsObject}`
    else msg = `touch: ${cmd.output}: ${fsObject}`
    if (glob.logger) glob.logger.error(msg, 'touch')
    throw new Error(msg)
  }
  return fsObject
}
