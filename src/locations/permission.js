/* eslint-disable no-bitwise */
export default class Permissions {
  canRead
  canWrite
  canExecute
  canDelete
  canTrash
  canRename
  userReal

  get octal() {
    return this._octal
  }

  get accessRights() {
    return this._octal
  }

  set _accessRights(permissions) {
    this._octal = permissions.toString().padStart(4, '0')
  }

  get user() {
    return this.__user
  }

  set _user(value) {
    this.__user = value
  }

  get group() {
    return this.__group
  }

  set _group(value) {
    this.__group = value
  }

  get symbol() {
    return [...this._octal]
      .map(number => {
        // noinspection JSBitwiseOperatorUsage
        return `${number & 4 ? 'r' : '-'}${number & 2 ? 'w' : '-'}${
          number & 1 ? 'x' : '-'
        }`
      })
      .join('')
  }

  get boolArray() {
    return [...this._octal].map(number => {
      return [(number & 4) === 4, (number & 2) === 2, (number & 1) === 1]
    })
  }

  set _boolArray(value) {
    if (value.length !== 3)
      throw new Error('array must contain 3 arrays of 3 booleans')
    const res = value.map(group => {
      if (group.length !== 3)
        throw new Error('array must contain 3 arrays of 3 booleans')
      // eslint-disable-next-line no-nested-ternary
      return (group[0] ? 4 : 0) + (group[1] ? 2 : 0) + (group[2] ? 1 : 0)
    })
    this._accessRights = res.join('')
  }

  toString() {
    return this.octal
  }

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
      userReal: this.userReal
    }
  }
}
