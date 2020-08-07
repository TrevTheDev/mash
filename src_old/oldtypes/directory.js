import FsObject from './fs object.js'
import { FILE_TYPE_ENUMS } from '../../src/util/globals.js'

/**
 *
 * Also, check out {@link http://www.google.com|Google}
 *
 * @class Directory
 * @property {string} path - the sanitised path displayed back to the user
 */

export default class Directory extends FsObject {
  // loadedContent = false
  // content

  constructor(u, path, createAutomationFunctions) {
    super(u, path, createAutomationFunctions)
    delete this.type
    this.type = FILE_TYPE_ENUMS.directory
    return this
  }

  toJSON(listing = false) {
    const json = super.toJSON()
    if (listing) json.content = this.content.toJSON()

    return super.toJSON()
  }

  // toString() {
  //   const def = {
  //     header: `hpath: ${this}`,
  //     table: [
  //       {heading: 'PERM', content: 'accessRights', width: 4},
  //       {heading: 'GRP', content: 'group', width: 10},
  //       {heading: 'USR', content: 'user', width: 10},
  //       {heading: 'NAME', content: 'name', width: 30}
  //     ],
  //     footer: `fpath: ${this}`
  //   }
  //   let res = ''
  //   if (def.header) res += `${def.header}\n`
  //   if (def.table) {
  //     let hrow = ''
  //     def.table.forEach(column => {
  //       hrow += column.heading.padEnd(column.width).substring(0, column.width)
  //     })
  //     res += `${hrow}\n`
  //     this.content().forEach(entry => {
  //       let row = ''
  //       def.table.forEach(column => {
  //         row += entry[column.content]
  //           .padEnd(column.width)
  //           .substring(0, column.width)
  //       })
  //       res += `${row}\n`
  //     })
  //   }
  //   if (def.footer) res += `${def.footer}`
  //   console.log(res)
  //   return res
  // }
}
