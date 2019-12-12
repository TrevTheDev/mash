/* eslint-disable no-await-in-loop */
/* eslint-disable no-param-reassign */
import {LOCAL, glob} from '../util/globals'

export default async fsObject => {
  const touch = await fsObject.sh(`touch -- ${fsObject.toSh()};`, 'touch')

  if (touch.error) {
    let msg
    if (touch.output.includes('Permission denied'))
      msg = `${LOCAL.permissionDenied}: touch: ${fsObject}`
    else msg = `touch: ${touch.output}: ${fsObject}`
    if (glob.logger) glob.logger.error(msg, 'touch')
    throw new Error(msg)
  }
  return fsObject
}
