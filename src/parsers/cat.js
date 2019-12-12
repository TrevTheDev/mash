import {LOCAL, glob} from '../util/globals'

export default async FSObject => {
  const cat = await FSObject.sh(`cat -- ${FSObject.toSh()};`)
  let msg
  if (cat.error) {
    if (cat.output.includes('Permission denied'))
      msg = `${LOCAL.permissionDenied}: cat: ${FSObject}`
    else msg = cat.output
    if (glob.logger) glob.logger.error(msg, 'cat')
    throw new Error(msg)
  }
  return cat.output
}
