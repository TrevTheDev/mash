/* eslint-disable no-bitwise */
// noinspection JSUnusedGlobalSymbols
export default class Permissions {
  /**
   * @param {string} accessRights
   * @param {User} user
   * @param {Group} group
   * @return {string}
   */
  constructor(accessRights, user, group) {
    this._octal = accessRights.toString().padStart(4, '0')
    this._user = user
    this._group = group
  }

  // canRead
  //
  // canWrite
  //
  // canExecute
  //
  // canDelete
  //
  // canTrash
  //
  // canRename
  //
  // userReal
  /**
   * @return {string}
   */
  get octal() {
    return this._octal
  }

  /**
   * @return {string}
   */
  get accessRights() {
    return this.octal
  }

  // set _accessRights(permissions) {
  //   this._octal = permissions.toString().padStart(4, '0')
  // }
  /**
   * @return {User}
   */
  get user() {
    return this._user
  }

  // set _user(value) {
  //   this.__user = value
  // }
  /**
   * @return {Group}
   */
  get group() {
    return this._group
  }

  // set _group(value) {
  //   this.__group = value
  // }
  /**
   * @return {string}
   */
  get symbol() {
    // noinspection JSBitwiseOperatorUsage
    return [...this.octal]
      .map((number) => `${number & 4 ? 'r' : '-'}${number & 2 ? 'w' : '-'}${
        number & 1 ? 'x' : '-'
      }`)
      .join('')
  }

  /**
   * @return {Array}
   */
  get boolArray() {
    return [...this.octal].map((number) => [(number & 4) === 4, (number & 2) === 2, (number & 1) === 1])
  }

  /**
   * @param {Array} value
   */
  set _boolArray(value) {
    if (value.length !== 3) throw new Error('array must contain 3 arrays of 3 booleans')
    const res = value.map((group) => {
      if (group.length !== 3) throw new Error('array must contain 3 arrays of 3 booleans')
      // eslint-disable-next-line no-nested-ternary
      return (group[0] ? 4 : 0) + (group[1] ? 2 : 0) + (group[2] ? 1 : 0)
    })
    this._octal = res.join('')
  }

  /**
   * @return {string}
   */
  toString() {
    return this.octal
  }

  /**
   * @return {Object}
   */
  toJSON() {
    return {
      group: this.group.toJSON(),
      user: this.user.toJSON(),
      octal: this.octal,
      symbolic: this.symbol,
      boolean: JSON.stringify(this.boolArray),
      canRead: this.canRead,
      canWrite: this.canWrite,
      canExecute: this.canExecute,
      canDelete: this.canDelete,
      canTrash: this.canTrash,
      canRename: this.canRename,
      userReal: this.userReal,
    }
  }
}
