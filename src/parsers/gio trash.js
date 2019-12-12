import {LOCAL, glob} from '../util/globals'

export default async fsObject => {
  const gioTrash = await fsObject.sh(
    `gio trash --force -- ${fsObject.toSh()};`,
    'gio trash'
  )
  if (fsObject.state === 'loaded') fsObject._transitionState('outdated')
  if (!gioTrash.error) return true

  let msg
  if (gioTrash.output.includes('Permission denied'))
    msg = `${LOCAL.permissionDenied}: gio trash: ${fsObject}`
  else if (gioTrash.output.includes('No such file or directory'))
    msg = `${LOCAL.pathNotFound}: gio trash: ${fsObject}`
  else msg = `gio trash: ${gioTrash.output}: ${fsObject}`
  if (glob.logger) glob.logger.error(msg, 'gio trash')
  throw new Error(msg)
}
