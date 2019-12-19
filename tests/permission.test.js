/* eslint-disable no-bitwise */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

import {promises as fsPromises} from 'fs'

import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

import Server, {u, ShellHarness} from '../src/server.js'
import Elevator from '../src/parsers/elevator.js'

chai.use(chaiAsPromised)

const {expect} = chai

describe('permission', () => {
  let server
  let cwd
  let tstDir
  before(async () => {
    if (Server.instance) Server.instance.close()
    server = new Server()
    cwd = u()
    tstDir = await cwd.addDirectory('test', true)
  })

  after(() => {
    if (Server.instance) Server.instance.close()
  })

  it('does not allow the setting of read only properties', async () => {
    await u(`${tstDir}/perm1Dir`).delete(true, undefined, true)
    const dummyDir = await tstDir.addDirectory('perm1Dir')
    const rights = await expect(dummyDir.accessRights).to.be.fulfilled
    const ns = await fsPromises.stat(`${dummyDir}`)

    expect(rights).to.equal(`0${(ns.mode & 0o777).toString(8)}`)
    expect(() => {
      dummyDir.accessRights = '0'
    }).to.throw()
    expect(dummyDir.accessRights).to.equal(`0${(ns.mode & 0o777).toString(8)}`)
  })

  it('changes permissions', async () => {
    const rootShell = new ShellHarness({
      user: 'root',
      rootPassword: process.env.RPASSWORD
    })
    await u(`${tstDir}/perm2Dir`, rootShell).delete(true, undefined, true)

    let dummyDir = await tstDir.addDirectory('perm2Dir')

    const elevator = new Elevator(
      async () =>
        new Promise(resolve =>
          setTimeout(() => resolve(process.env.RPASSWORD), 20)
        )
    )

    const doneCallback = (cmd, elevatorCmdType) =>
      elevator.elevateIfRequired(cmd, elevatorCmdType)

    server.shell.config.doneCallback = doneCallback

    await expect(dummyDir.delete(true)).to.be.fulfilled
    server.shell.config.doneCallback = undefined

    dummyDir = await tstDir.addDirectory('perm2Dir')
    const newDirs = await dummyDir.addDirectory(['chmod', 'D2', 'D3'], true)
    await expect(newDirs[0].setPermissions('777', true)).to.be.fulfilled
    await expect(newDirs[0].setPermissions('775', true)).to.be.fulfilled
    expect(newDirs[0].state).to.equal('loadable')
    await newDirs[0].stat()
    expect(newDirs[0].accessRights).to.equal('0775')
    await expect(newDirs[0].setPermissions('o+w', true)).to.be.fulfilled
    expect(await newDirs[0].accessRights).to.equal('0777')
    await expect(newDirs[0].setPermissions('555')).to.be.fulfilled
    await expect(newDirs[1].setPermissions('555')).to.be.fulfilled
    await expect(newDirs[2].setPermissions('555')).to.be.fulfilled
    await expect(newDirs[2].setPermissions('000')).to.be.fulfilled
    expect(await newDirs[0].accessRights).to.equal('0555')
    expect(await newDirs[1].accessRights).to.equal('0555')
    expect(await newDirs[2].accessRights).to.equal('0000')

    await expect(newDirs[2].delete()).to.be.rejected

    await expect(newDirs[0].setPermissions('000')).to.be.fulfilled
    await expect(newDirs[1].setPermissions('000')).to.be.rejected

    await expect(u(`${process.cwd()}/test/perm2Dir/chmod/D2`).stat()).to.be
      .rejected

    const D2 = u(`${process.cwd()}/test/perm2Dir/chmod/D2`, rootShell)

    await expect(D2.stat()).to.be.fulfilled
    await expect(D2.setPermissions('000')).to.be.fulfilled

    server.shell.config.doneCallback = doneCallback

    await expect(newDirs[1].delete(true)).to.be.fulfilled

    await expect(newDirs[0].delete()).to.be.fulfilled

    await expect(u(`${process.cwd()}/test/perm2Dir/chmod`).stat()).to.be
      .rejected

    await u(`${tstDir}/perm2Dir`, rootShell).delete(true, undefined, true)

    rootShell.close()

    server.shell.config.doneCallback = undefined
  })

  it('permissions and symlinks', async () => {
    const rootShell = new ShellHarness({
      user: 'root',
      rootPassword: process.env.RPASSWORD
    })
    await u(`${tstDir}/SimPer`, rootShell).delete(true, undefined, true)
    await u(`${tstDir}/SimPerLink`, rootShell).delete(true, undefined, true)

    const RL1 = await u(`${tstDir}`, rootShell).addDirectory('SimPer')
    await expect(RL1.setPermissions('000')).to.be.fulfilled

    const SL = u(`${tstDir}/SimPerLink`)
    await expect(SL.linkTo(RL1)).to.be.fulfilled

    await expect(SL.addFile('HELLO', 'HELLO')).to.be.rejected

    const RSL = u(`${tstDir}/SimPerLink`, rootShell)
    await expect(RSL.setUser(process.env.USER, process.env.USER)).to.be
      .fulfilled
    await expect(RSL.setPermissions('777', true)).to.be.fulfilled // TODO: apparently mac hands symlinks differently see chmod -h

    await expect(SL.addFile('HELLO', 'HELLO')).to.be.fulfilled

    rootShell.close()
  })
})
