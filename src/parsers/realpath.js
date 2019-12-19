import {glob} from '../util/globals.js'

// /**
//  * readlinks `path`
//  *
//  * @param {Shell Function} shell shell to use to execute readlink
//  * @param {Path || String} path path to readlink.  If true, readlink can be elevated
//  * @param { checkExistence check whether file exists or not
//  * @returns {Path} readlink path
//  */
// export default async (
//   executionContext,
//   path,
//   realpathType = 'canonicalize-missing'
// ) => {
//   const opt = (pathType => {
//     switch (pathType) {
//       case 'canonicalize-existing':
//         return 'es'
//       case 'canonicalize-missing':
//         return 'ms'
//       case 'canonicalize':
//         return ''
//       default:
//         throw new Error('unknown readlinkType')
//     }
//   })(realpathType)
//   const realpath = await executionContext.sh(
//     `realpath -z${opt} -- "$(cat<<'+++EOF+++'\n${path}\n+++EOF+++\n)";`
//   )
//   if (realpath.error) {
//     if (
//       realpathType === 'canonicalize-existing' &&
//       realpath.output.includes('No such file or directory')
//     )
//       return false
//     const errMsg = `readlink: ${LOCAL.pathNotFound}: ${path}`
//     if (glob.logger) glob.logger.error({message: errMsg, source: 'realpath'})
//     throw new Error(errMsg)
//   }
//   return realpath.output.substring(0, realpath.output.length - 1)
// }

export const pathExists = async (executionContext, path) => {
  const realpath = await executionContext.sh(`pathExists ${path.toSh()};`)
  if (realpath.error) {
    if (realpath.output.includes('No such file or directory')) return false
    const errMsg = `pathExists: ${path}: ${realpath.output}`
    if (glob.logger) glob.logger.error(errMsg, 'pathExists')
    throw new Error(errMsg)
  }
  return realpath.output.substring(0, realpath.output.length - 1)
}

export const canonisePath = async (executionContext, path) => {
  const realpath = await executionContext.sh(`realpath -zsm -- ${path.toSh()};`)
  if (realpath.error) {
    const errMsg = `canonisePath: ${path}: ${realpath.output}`
    if (glob.logger) glob.logger.error(errMsg, 'canonisePath')
    throw new Error(errMsg)
  }
  return realpath.output.substring(0, realpath.output.length - 1)
}

export const symlinkTarget = async (executionContext, path) => {
  const realpath = await executionContext.sh(`symlinkTarget ${path.toSh()};`)
  if (realpath.error) {
    if (realpath.output.includes('No such file or directory')) return false
    const errMsg = `symlinkTarget: ${path}: ${realpath.output}`
    if (glob.logger) glob.logger.error(errMsg, 'symlinkTarget')
    throw new Error(errMsg)
  }
  return realpath.output
}
