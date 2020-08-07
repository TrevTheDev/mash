import getDestDirectory from './get dest directory.js'
import { populateDirectory } from '../cmds.js'
import { FILE_TYPE_ENUMS } from '../../util/globals.js'
import copyFile from './copy file.js'

const copyDirectory = async (copyManager, src, dstP, isNewTree = false) => {
  copyManager.progressUpdateBeforeCopy(src.path, dstP)

  if (copyManager.cancelled) return { cancelled: true }

  const { dst, clean } = await getDestDirectory(
    src,
    dstP,
    copyManager.copyType,
    isNewTree,
  )

  await populateDirectory(src, false, true, false)

  const pa = src.content.map((srcFSObject) => (srcFSObject.type === FILE_TYPE_ENUMS.directory
    ? copyDirectory(copyManager, srcFSObject, dst, clean)
    : copyFile(copyManager, srcFSObject, dst, clean)))
  pa.push(dst.cloneAttrs(src))
  await Promise.all(pa)
  const copiedDir = src.executionContext.getDirectoryPromise(dst.toString())
  if (copyManager.move && !copyManager.cancelled) {
    const srcContent = await populateDirectory(src, false, false, false)
    if (srcContent.content.length === 0) await src.delete()
  }

  copyManager.progressUpdateDirDone()
  return copiedDir
}

export default copyDirectory
