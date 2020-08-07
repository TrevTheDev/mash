import { LOCAL, glob } from '../util/globals.js'

export const cat = async (fsObject) => {
  const catSh = await fsObject.sh(`cat -- ${fsObject.toSh()};`)
  let msg
  if (catSh.error) {
    if (catSh.output.includes('Permission denied')) msg = `${LOCAL.permissionDenied}: cat: ${fsObject}`
    else msg = catSh.output
    if (glob.logger) glob.logger.error(msg, 'cat')
    throw new Error(msg)
  }
  return catSh.output
}
