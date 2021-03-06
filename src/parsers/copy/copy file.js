import { CP_TYPE, glob, LOCAL } from '../../util/globals.js'

const handleDirtyPath = async (isNewTree, copyManager, src, dstP) => {
  if (isNewTree) return true
  let dst = await src.executionContext.getFsObjectPathed(dstP.path.addSegment(src.path.base).toString())

  if (!(await dst.exists)) return true

  dst = await dst.stat(false, false, false)
  if (dst.type !== src.type) throw new Error(`${LOCAL.fileExpected}: ${dst.type}: ${dst}`) // TODO: Test

  switch (copyManager.copyType) {
    case CP_TYPE.overwrite:
      return true
    case CP_TYPE.overwriteOlder:
      return src.timeOfLastModification > dst.timeOfLastModification // TODO: Test
    case CP_TYPE.askBeforeOverwrite:
      return copyManager.askBeforeOverwrite(src, dst)
    case CP_TYPE.doNotOverwrite:
      copyManager.cancelled = true
      throw new Error(`${LOCAL.fsObjAlreadyExists}: ${dst}`)
    default:
      copyManager.cancelled = true
      throw new Error(`${LOCAL.invalidArgument}: copyType`)
  }
}

const rsyncProgressParser = (copyManager, stdout) => {
  const arr = stdout
    .replace(/,/g, '')
    .split(/(\s+)/)
    .filter((e) => e.trim().length > 0)
  const bytesCopied = /^\d+$/.test(arr[0]) ? parseInt(arr[0], 10) : undefined
  // const percentageCopied = /^\d+%$/.test(arr[1])
  //    new Size(parseInt(arr[1].replace('%', ''), 10))
  //   : undefined
  if (bytesCopied) copyManager.progressUpdate(0, bytesCopied)
}

const copyFile = async (copyManager, src, dstP, isNewTree = false) => {
  if (copyManager.cancelled) return { cancelled: true }

  const newFilePath = dstP.path.addSegment(src.path.base)

  copyManager.progressUpdateBeforeCopy(src.path, dstP.path)

  if (!(await handleDirtyPath(isNewTree, copyManager, src, dstP))) return false

  const rsyncCmd = src.sh(
    `rsync -Il --info=progress2  ${src.toSh()} ${dstP.toSh()};`,
    'rsync',
  )
  rsyncCmd.on('data', (stdout) => rsyncProgressParser(copyManager, stdout))

  const rsync = await rsyncCmd

  if (rsync.error) {
    let errMsg
    if (rsync.output.includes('Permission denied')) errMsg = `copyFile: ${LOCAL.permissionDenied}: ${src}: ${dstP}`
    else errMsg = `copyFile: ${rsync.output}: ${src}: ${dstP}`
    if (glob.logger) glob.logger.error(errMsg, 'copyFile')
    throw new Error(errMsg)
  }

  const copiedFile = src.executionContext.getFilePromise(newFilePath.toString())
  const sz = src.size

  if (copyManager.move && !copyManager.cancelled) await src.delete()

  copyManager.progressUpdateAfterFileCopied(sz)
  return copiedFile
}

export default copyFile
