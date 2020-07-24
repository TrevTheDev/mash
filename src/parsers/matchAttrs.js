import { LOCAL, glob } from '../util/globals.js'

export const matchAttrs = async (targetFSObject, sourceFSObject) => {
  const srcFSObject = await sourceFSObject.stat()
  const attrs = srcFSObject.lsattr.toClone
  const cmd = `matchAttrs ${srcFSObject.group} ${srcFSObject.user} ${
    srcFSObject.permissions
  } ${attrs} ${targetFSObject.toSh()} ${srcFSObject.toSh()};`

  const match = await targetFSObject.sh(cmd, 'matchAttrs')

  if (match.error) {
    let msg
    if (match.output.includes('Operation not permitted')) msg = `cloneAttrs: ${LOCAL.permissionDenied}: ${srcFSObject}`
    else if (match.output.includes('xxxxxxxxxx')) msg = `cloneAttrs: ${LOCAL.directoryNotFound}: ${srcFSObject}`
    else msg = `cloneAttrs: ${match.output}: ${srcFSObject}`
    if (glob.logger) glob.logger.error(msg, 'cloneAttrs')
    throw new Error(msg)
  }

  targetFSObject.markAsInvalid()

  return targetFSObject
}
