import {glob} from '../util/globals.js'

export default async server => {
  const gioTrashEmpty = await server.sh('gio trash --empty;')

  if (!gioTrashEmpty.error) return true

  const msg = `gio trash empty: ${gioTrashEmpty.output}`
  if (glob.logger) glob.logger.error(msg, 'gio trash')
  throw new Error(msg)
}
