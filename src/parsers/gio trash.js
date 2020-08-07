import { LOCAL, glob } from '../util/globals.js'

export const gioTrash = async (fsObject) => {
  const cmd = await fsObject.sh(
    `gio trash --force -- ${fsObject.toSh()};`,
    'gio trash',
  )
  fsObject.markAsInvalid()
  if (!cmd.error) return true

  let msg
  if (cmd.output.includes('Permission denied')) msg = `${LOCAL.permissionDenied}: gio trash: ${fsObject}`
  else if (cmd.output.includes('No such file or directory')) msg = `${LOCAL.pathNotFound}: gio trash: ${fsObject}`
  else msg = `gio trash: ${cmd.output}: ${fsObject}`
  if (glob.logger) glob.logger.error(msg, 'gio trash')
  throw new Error(msg)
}
