import {LOCAL, glob} from '../util/globals'

export default async (FSObject, group, recursive) => {
  const chgrp = await FSObject.sh(
    `chgrp ${recursive ? '-R' : ''} ${group} -- ${FSObject.toSh()};`,
    'chgrp'
  )
  if (chgrp.error) {
    let msg
    if (chgrp.output.includes('Operation not permitted'))
      msg = `${LOCAL.permissionDenied}: chgrp: ${FSObject}`
    else msg = `chgrp: ${chgrp.output}`
    if (glob.logger) glob.logger.error(msg, 'chgrp')
    throw new Error(msg)
  }
  if (FSObject.state === 'loaded') FSObject._transitionState('outdated')
  return FSObject
}
