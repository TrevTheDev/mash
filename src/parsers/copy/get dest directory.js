import {CP_TYPE, LOCAL, FILE_TYPE_ENUMS} from '../../util/globals.js'

export default async (src, dstP, copyType, isNewTree) => {
  const dstName = src.path.base

  const makeNewDst = async () => {
    const newDst = await dstP.addDirectory(dstName)
    return {dst: newDst, clean: true}
  }

  if (isNewTree) return makeNewDst()

  const dst = await src.executionContext.getFSObjFromPath(
    dstP.path.addSegment(dstName)
  )

  if (!(await dst.exists)) return makeNewDst()

  await dst.stat(false, false)
  if (dst.type !== FILE_TYPE_ENUMS.directory)
    throw new Error(`${LOCAL.dirExpected}: ${dst.type}: ${dst}`) // TODO: Test

  switch (copyType) {
    case CP_TYPE.overwrite:
    case CP_TYPE.overwriteOlder:
    case CP_TYPE.askBeforeOverwrite:
      return {dst, clean: false}
    case CP_TYPE.doNotOverwrite:
      throw new Error(`${LOCAL.fsObjAlreadyExists}: ${dst}`)
    default:
      throw new Error(`${LOCAL.invalidArgument}: copyType`)
  }
}
