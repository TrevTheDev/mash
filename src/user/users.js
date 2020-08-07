/* eslint-disable max-classes-per-file */
import { id as posixId } from '../parsers/cmds.js'

/* eslint-disable class-methods-use-this */
class BaseUser {
  constructor(users, id, name) {
    this._users = users
    this._id = id
    this._name = name
  }

  get users() {
    return this._users
  }

  get name() {
    return this._name
  }

  toString() {
    return this._name
  }
}

// noinspection JSUnusedGlobalSymbols
class Group extends BaseUser {
  get type() {
    return 'group'
  }

  get gid() {
    return this._id
  }

  get knownUsers() {
    return this._knownUsers
  }

  toString() {
    return this.name
  }

  toJSON() {
    return { group: this.name, gid: this.gid }
  }
}

class User extends BaseUser {
  get type() {
    return 'user'
  }

  get groups() {
    return this._groups
  }

  get effectiveGroup() {
    return this._effectiveGroup
  }

  get uid() {
    return this._id
  }

  _addGroup(gid, name, effectiveGroup) {
    const group = this.users._getGroup(gid, name)
    if (!this._groups) this._groups = []
    this._groups.push(group)
    if (effectiveGroup) this._effectiveGroup = group
  }

  toString() {
    return this.name
  }

  toJSON() {
    return { user: this.name, uid: this.uid }
  }
}

export default class Users {
  /**
   * @param {ExecutionContext} [executionContext]
   * @returns {User}
   */
  constructor(executionContext) {
    this._executionContext = executionContext
    this._knownUsers = {}
    this._knownGroups = {}
  }

  getUser(uidOrName) {
    return posixId(this, uidOrName)
  }

  get currentUser() {
    return this.getUser()
  }

  get currentGroup() {
    return new Promise((resolve) => {
      (async () => {
        const user = await this.getUser()
        resolve(user.effectiveGroup)
      })()
    })
  }

  _getUser(uid, name) {
    if (this._knownUsers[uid]) return this._knownUsers[uid]
    const user = new User(this, uid, name)
    this._knownUsers[user.id] = user
    return user
  }

  _getGroup(gid, name) {
    if (this._knownGroups[gid]) return this._knownGroups[gid]
    const group = new Group(this, gid, name)
    this._knownGroups[gid] = group
    return group
  }

  /**
   * @returns {ExecutionContext}
   */
  get executionContext() {
    return this._executionContext
  }

  get knownUsers() {
    return this._knownUsers
  }

  get knownGroups() {
    return this._knownGroups
  }
}
