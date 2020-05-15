import {LOCAL, glob} from '../util/globals.js'

const cat = async FSObject => {
  const catSh = await FSObject.sh(`cat -- ${FSObject.toSh()};`)
  let msg
  if (catSh.error) {
    if (catSh.output.includes('Permission denied'))
      msg = `${LOCAL.permissionDenied}: cat: ${FSObject}`
    else msg = catSh.output
    if (glob.logger) glob.logger.error(msg, 'cat')
    throw new Error(msg)
  }
  return catSh.output
}
export default cat
