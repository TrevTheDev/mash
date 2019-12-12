/* eslint-disable no-param-reassign */
import Size from '../../formatters/size'
import {FILE_TYPE_ENUMS} from '../../util/globals'

/**
 * translates a stat file type string to a FILE_TYPE_ENUMS
 *
 * @param {string} fileType - raw string from stat
 * @returns FILE_TYPE_ENUMS
 */
const translateToFileTypeEnum = fileType => {
  switch (fileType) {
    case 'regular empty file':
    case 'regular file':
      return FILE_TYPE_ENUMS.file
    case 'directory':
      return FILE_TYPE_ENUMS.directory
    case 'symbolic link':
      return FILE_TYPE_ENUMS.symbolicLink
    case 'character special file':
      return FILE_TYPE_ENUMS.characterDevice
    case 'block device':
      return FILE_TYPE_ENUMS.blockDevice
    case 'socket':
      return FILE_TYPE_ENUMS.localSocket
    case 'fifo':
      return FILE_TYPE_ENUMS.namedPipe
    default:
      throw new Error('state: unknown file type')
  }
}

/**
 * takes raw stat string, parses it, and updates `fsObj`
 * @param {string} statOutput - raw string output from stat
 * @param {object} fsObj - obj to imbue with stat information
 * @returns updated `fsObj`
 */
export default (statOutput, fsObj) => {
  const obj = fsObj._props
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
    path
  ] = statOutput.split('\0')
  fsObj._permissions._accessRights = accessRights
  fsObj._permissions._user = fsObj.executionContext.server.users._getUser(
    parseInt(userId, 10),
    user
  )
  fsObj._permissions._group = fsObj.executionContext.server.users._getGroup(
    parseInt(groupId, 10),
    group
  )
  fsObj.paths._setStatPath(path)
  obj.type = translateToFileTypeEnum(type)

  obj.blocksAllocated = parseInt(blocksAllocated, 10)
  obj.deviceNumber = parseInt(deviceNumber, 10)
  obj.numberHardLinks = parseInt(numberHardLinks, 10)
  obj.inode = parseInt(inode, 10)
  obj.size = new Size(parseInt(totalSizeInBytes, 10))
  obj.majorDeviceType = parseInt(majorDeviceType, 10)
  obj.minorDeviceType = parseInt(minorDeviceType, 10)

  obj.timeOfBirth =
    timeOfBirth === '-' ? null : new Date(Date.parse(timeOfBirth))
  obj.timeOfLastAccess = new Date(Date.parse(timeOfLastAccess))
  obj.timeOfLastModification = new Date(Date.parse(timeOfLastModification))
  // obj.timeOfLastModification = new Date(
  //   parseInt(timeOfLastModification, 10) * 1000
  // )
  obj.timeOfLastMetaDataChange = new Date(Date.parse(timeOfLastMetaDataChange))
  obj.loadedStat = true
}
