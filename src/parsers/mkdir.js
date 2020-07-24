/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { LOCAL, glob } from '../util/globals.js'
/**
 * mkDir - see `addDirectory`
 * TODO: code could be slightly optimised (lowest priority)
 * TODO: consider using Array of Paths
 * @param {Directory|DirectoryBase} directory - parent directory
 * @param {string} folderName folder - name to add
 * @param {boolean} ignoreAnyExistingDirectories - whether to overwrite existing directories (-p)
 * @returns
 */

const mkDirCmd = async (directory, folderName, ignoreAnyExistingDirectories) => {
  const newDirPath = directory.path.addSegment(`${folderName}`)
  const mkdir = await directory.sh(
    `( cd -- ${directory.toSh()} && exec mkdir${
      ignoreAnyExistingDirectories ? ' -p' : ''
    } -- "$(cat<<'+++EOF+++'\n${folderName}\n+++EOF+++\n)");`,
    'mkdir',
  )

  if (mkdir.error) {
    let msg
    if (mkdir.output.includes('File exists')) msg = `${LOCAL.fsObjAlreadyExists}: mkdir: ${newDirPath}`
    else if (mkdir.output.includes('Permission denied')) msg = `${LOCAL.permissionDenied}: mkdir: ${newDirPath}`
    else if (mkdir.output.includes('no such file or directory')) msg = `${LOCAL.pathNotFound}: mkdir: ${newDirPath}`
    else if (mkdir.output.includes('spawn failed')) msg = `${LOCAL.unableToMkdir}: mkdir: ${newDirPath}`
    else msg = `mkdir: ${mkdir.output}: ${newDirPath}`
    if (glob.logger) glob.logger.error(msg, 'mkdir')
    throw new Error(msg)
  }

  const newDir = directory.executionContext.getDirectoryPathed(`${newDirPath}`)
  newDir._pvt.parent = directory
  return newDir
}

export const mkdir = async (directory, tree, ignoreAnyExistingDirectories) => {
  const rArr = new glob.fsObjectsByType.FsObjectArray()
  for (const branch of tree) {
    let res
    if (Array.isArray(branch)) res = await mkdir(directory, branch, ignoreAnyExistingDirectories)
    else {
      res = await mkDirCmd(directory, branch, ignoreAnyExistingDirectories)
      // eslint-disable-next-line no-param-reassign
      directory = res
    }
    rArr.push(res)
  }
  return rArr
}
