import { FILE_TYPE_ENUMS } from '../../util/globals.js'

import { ln } from '../../parsers/ln.js'
import { Path } from '../path.js'

const symlinkMixin = (Base) => class extends Base {
  /**
   * @returns {FILE_TYPE_ENUMS}
   */
  // eslint-disable-next-line class-methods-use-this
  get type() { return FILE_TYPE_ENUMS.symbolicLink }

  /**
   * @param {string|Path} destination
   * @returns {Symlink}
   */
  async linkTo(destination) {
    await this._canonisePath()
    return ln(this, new Path(`${destination}`))
  }
}

export default symlinkMixin
