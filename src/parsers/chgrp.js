import {LOCAL, glob} from '../util/globals.js'

const chgrp = async (FSObject, group, recursive) => {
  const chgrpSh = await FSObject.sh(
    `chgrp ${recursive ? '-R' : ''} ${group} -- ${FSObject.toSh()};`,
    'chgrp'
  )
  if (chgrpSh.error) {
    let msg
    if (chgrpSh.output.includes('Operation not permitted'))
      msg = `${LOCAL.permissionDenied}: chgrp: ${FSObject}`
    else msg = `chgrp: ${chgrpSh.output}`
    if (glob.logger) glob.logger.error(msg, 'chgrp')
    throw new Error(msg)
  }
  if (FSObject.state === 'loaded') FSObject._transitionState('outdated')
  return FSObject
}
export default chgrp
