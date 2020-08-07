/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { LOCAL, glob } from '../util/globals.js'
/**
 * mkDir - see `addDirectory`
 * TODO: code could be slightly optimised (lowest priority)
 * TODO: consider using Array of Paths
 * @param {Directory|DirectoryPromise|FsObject} directory - parent directory
 * @param {string} folderName folder - name to add
 * @param {boolean} ignoreAnyExistingDirectories - whether to overwrite existing directories (-p)
 * @returns {Directory}
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

  const newDir = directory.executionContext.getDirectoryPromise(`${newDirPath}`)
  newDir._pvt.parent = directory
  return newDir
}

/**
 * @param {Directory|DirectoryPromise|FsObject} directory
 * @param {Array<string>|Array<Path>|Array<Array>} tree
 * @param {boolean} ignoreAnyExistingDirectories
 * @returns {FsObjectArray}
 */
export const mkdir = async (directory, tree, ignoreAnyExistingDirectories) => {
  const rArr = new glob.fsObjectsByType.FsObjectArray()
  let workingDir = directory
  let res
  for (const branch of tree) {
    if (Array.isArray(branch)) res = await mkdir(workingDir, branch, ignoreAnyExistingDirectories)
    else {
      res = await mkDirCmd(workingDir, branch, ignoreAnyExistingDirectories)
      workingDir = res
    }
    rArr.push(res)
  }
  return rArr
}
