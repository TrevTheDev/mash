import Permissions from '../../locations/permission.js'
import { glob } from '../../util/globals.js'
import { PathContainer } from '../../locations/path.js'

/**
 * takes raw stat string, parses it, and updates `fsObj`
 * @param {string} statOutput - raw string output from stat
 * @param {ExecutionContext} executionContext
 * @returns {File|Directory|Symlink}
 */
const stat = (statOutput, executionContext) => {
  const { users } = executionContext.server
  const [
    accessRights,
    blocksAllocated,
    deviceNumber,
    type,
    groupId,
    group,
    numberHardLinks,
    inode,
    totalSizeInBytes,
    majorDeviceType,
    minorDeviceType,
    userId,
    user,
    timeOfBirth,
    timeOfLastAccess,
    timeOfLastModification,
    timeOfLastMetaDataChange,
    path,
  ] = statOutput.split('\0')

  return new glob.fsObjectsByType[type](
    executionContext,
    new PathContainer(executionContext, undefined, path),
    {
      permissions: new Permissions(
        accessRights,
        users._getUser(parseInt(userId, 10), user),
        users._getGroup(parseInt(groupId, 10), group),
      ),
      blocksAllocated: parseInt(blocksAllocated, 10),
      deviceNumber: parseInt(deviceNumber, 10),
      numberHardLinks: parseInt(numberHardLinks, 10),
      inode: parseInt(inode, 10),
      size: parseInt(totalSizeInBytes, 10),
      majorDeviceType: parseInt(majorDeviceType, 10),
      minorDeviceType: parseInt(minorDeviceType, 10),

      timeOfBirth: timeOfBirth === '-' ? null : new Date(Date.parse(timeOfBirth)),
      timeOfLastAccess: new Date(Date.parse(timeOfLastAccess)),
      timeOfLastModification: new Date(Date.parse(timeOfLastModification)),
      // obj.timeOfLastModification: new Date(
      //   parseInt(timeOfLastModification, 10) * 1000
      // )
      timeOfLastMetaDataChange: new Date(Date.parse(timeOfLastMetaDataChange)),
      loadedStat: true,
    },
  )
  // fsObj.paths._setStatPath(path)
  // return fsObj
}
export default stat
