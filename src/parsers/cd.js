import { LOCAL, glob } from '../util/globals.js'
import { pwd } from './cmds.js'

export const cd = async (fsObject) => {
  const cmd = await fsObject.sh(
    `cd -- ${fsObject.toSh()};`,
    undefined,
    undefined,
    true,
  )
  if (cmd.error) {
    let msg
    if (cmd.output.includes('Permission denied')) msg = `${LOCAL.permissionDenied}: cd: ${fsObject}`
    else if (cmd.output.includes('no such file or directory')) msg = `${LOCAL.directoryNotFound}: cd: ${fsObject}`
    else msg = `cd: ${cmd.output}`
    if (glob.logger) glob.logger.error(msg, 'cd')
    throw new Error(msg)
  }
  return pwd(fsObject.executionContext)
}
