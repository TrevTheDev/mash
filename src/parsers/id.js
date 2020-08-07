/* eslint-disable no-param-reassign */
import { LOCAL, glob } from '../util/globals.js'
/**
 * @param {Users} users
 * @param {String} uidOrName - default = ''
 * @returns
 */
export const id = async (users, uidOrName = '') => {
  const idSh = await users.executionContext.shell.createCommand(
    `user_info ${uidOrName};`,
  )
  if (idSh.error) {
    let msg
    if (idSh.output.includes('no such user')) msg = `${LOCAL.noSuchUser}: id: ${uidOrName}`
    else msg = `id: ${idSh.output}`
    if (glob.logger) glob.logger.error(msg, 'id')
    throw new Error(msg)
  }

  const Res = idSh.output.split('\n')
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
      effectiveGroupId === parseInt(groupIds[i], 10),
    )
  }
  return user
}
