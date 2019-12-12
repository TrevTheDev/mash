import {LOCAL, glob} from '../util/globals'

export default async (targetFSObject, sourceFSObject) => {
  if (sourceFSObject.state !== 'loaded') await sourceFSObject.stat()
  const attrs = sourceFSObject.lsattr.toClone
  const cmd = `matchAttrs ${sourceFSObject.group} ${sourceFSObject.user} ${
    sourceFSObject.permissions
  } ${attrs} ${targetFSObject.toSh()} ${sourceFSObject.toSh()};`

  const match = await targetFSObject.sh(cmd, 'matchAttrs')

  if (match.error) {
    let msg
    if (match.output.includes('Operation not permitted'))
      msg = `cloneAttrs: ${LOCAL.permissionDenied}: ${sourceFSObject}`
    else if (match.output.includes('xxxxxxxxxx'))
      msg = `cloneAttrs: ${LOCAL.directoryNotFound}: ${sourceFSObject}`
    else msg = `cloneAttrs: ${match.output}: ${sourceFSObject}`
    if (glob.logger) glob.logger.error(msg, 'cloneAttrs')
    throw new Error(msg)
  }

  if (targetFSObject.state === 'loaded')
    targetFSObject._transitionState('outdated')

  return targetFSObject
}
