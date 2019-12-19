import {LOCAL, glob} from '../util/globals.js'
import pwd from './pwd.js'

export default async FSObject => {
  const cd = await FSObject.sh(
    `cd -- ${FSObject.toSh()};`,
    undefined,
    undefined,
    true
  )
  if (cd.error) {
    let msg
    if (cd.output.includes('Permission denied'))
      msg = `${LOCAL.permissionDenied}: cd: ${FSObject}`
    if (cd.output.includes('no such file or directory'))
      msg = `${LOCAL.directoryNotFound}: cd: ${FSObject}`
    else msg = `cd: ${cd.output}`
    if (glob.logger) glob.logger.error(msg, 'cd')
    throw new Error(msg)
  }
  return pwd(FSObject.executionContext)
}
