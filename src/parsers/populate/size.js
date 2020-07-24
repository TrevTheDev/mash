import DirectorySize from '../../util/directory size.js'

const size = (sizeOutput, fsObj) => {
  const obj = fsObj._props
  // if (sizeOutput.includes('SIZEFAILED')) {
  //   obj.loadedSize = false
  //   obj.sizeOutput = sizeOutput
  //   return
  // }
  const sizeArray = sizeOutput.split('\0')
  const detailedArray = sizeArray[1].split('\n')
  const dirCount = parseInt(detailedArray[2], 10)
  const objCount = parseInt(detailedArray[1], 10)
  obj.size = new DirectorySize(
    parseInt(detailedArray[0], 10),
    parseInt(sizeArray[0].split(/\t/)[0], 10),
    dirCount,
    objCount - dirCount,
  )
  obj.loadedSize = true
}
export default size
