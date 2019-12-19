/* eslint-disable no-param-reassign */
import {LOCAL, glob} from '../util/globals.js'
/**
 * mkdir - see `addDirectory`
 * TODO: check what happens if person tries to delete /
 * TODO: check what happens if insufficient permissions
 * @param {string} path
 * @param {boolean} requireDirectoryToBeEmpty
 * @param {boolean} limitToCWDFilesystem
 * @returns
 */
export default async (users, uidOrName = '') => {
  const id = await users.executionContext.shell.createCommand(
    `user_info ${uidOrName};`
  )
  if (id.error) {
    let msg
    if (id.output.includes('no such user'))
      msg = `${LOCAL.noSuchUser}: id: ${uidOrName}`
    else msg = `id: ${id.output}`
    if (glob.logger) glob.logger.error(msg, 'id')
    throw new Error(msg)
  }

  const Res = id.output.split('\n')
  const user = users._getUser(parseInt(Res[0], 10), Res[1])
  const effectiveGroupId = parseInt(Res[2], 10)
  const groupIds = Res[3].split(' ')
  const groupNames = Res[4].split(' ')
  const max = groupIds.length
  user._groups = []
  for (let i = 0; i < max; i += 1) {
    user._addGroup(
      parseInt(groupIds[i], 10),
      groupNames[i],
      effectiveGroupId === parseInt(groupIds[i], 10)
    )
  }
  return user
}
