import { LOCAL, glob } from '../util/globals.js'

export const chgrp = async (fsObject, group, recursive) => {
  const chgrpSh = await fsObject.sh(
    `chgrp ${recursive ? '-R' : ''} ${group} -- ${fsObject.toSh()};`,
    'chgrp',
  )
  if (chgrpSh.error) {
    let msg
    if (chgrpSh.output.includes('Operation not permitted')) msg = `${LOCAL.permissionDenied}: chgrp: ${fsObject}`
    else msg = `chgrp: ${chgrpSh.output}`
    if (glob.logger) glob.logger.error(msg, 'chgrp')
    throw new Error(msg)
  }
  fsObject.markAsInvalid()
  return fsObject
}
