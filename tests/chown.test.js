/* eslint-disable mocha/no-setup-in-describe */
/* eslint-disable mocha/no-hooks-for-single-case */
/* eslint-disable no-unused-expressions */

import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import Server, { ShellHarness, u } from '../src/server.js'
import Elevator from '../src/parsers/elevator.js'

chai.use(chaiAsPromised)

const { expect } = chai

describe('chown', () => {
  let tstDir
  before(async () => {
    if (Server.instance) Server.instance.close()
    const cwd = u()
    tstDir = await cwd.addDirectory('test', true)
  })
  after(() => {
    if (Server.instance) Server.instance.close()
  })
  step('can read FS Objects user and group', async () => {
    await u(`${tstDir}/chownD1`).delete(true, undefined, true)
    let chownD1 = await tstDir.addDirectory('chownD1', true)
    chownD1 = await chownD1.stat()
    expect(`${chownD1.user}`).to.equal(process.env.USER)
    expect(chownD1.user.uid).to.equal(process.getuid())
    expect(chownD1.group.gid).to.equal(process.getgid())
  })
  step('can set FS Objects user and group', async () => {
    // await tstDir.addDirectory(['P1', 'P2'])

    const rootShell = new ShellHarness({
      user: 'root',
      rootPassword: process.env.RPASSWORD,
    })

    await u(`${tstDir}/chownD2A`, rootShell).delete(true, undefined, true)

    await tstDir.addDirectory(['chownD2A', 'P2'])

    let P1 = u(`${tstDir}/chownD2A`, rootShell)
    let P2 = await P1.u('P2')
    await expect(P1.setUser('testusr', 'testusr')).to.be.fulfilled
    P1 = await P1.stat()

    expect(`${P1.user}`).to.equal('testusr')
    expect(`${P1.group}`).to.equal('testusr')
    P2 = await P2.stat()
    expect(`${P2.user}`).to.equal(process.env.USER)
    expect(P2.group.gid).to.equal(process.getgid())

    await P1.delete(true)
    rootShell.close()
  })
  step('can set FS Objects user and group recursively', async () => {
    const rootShell = new ShellHarness({
      user: 'root',
      rootPassword: process.env.RPASSWORD,
    })

    await u(`${tstDir}/chownD3A`, rootShell).delete(true, undefined, true)

    await tstDir.addDirectory(['chownD3A', 'P2'])

    const P1 = u(`${tstDir}/chownD3A`, rootShell)
    let P2 = await P1.u('P2')
    await expect(P1.setUser('testusr', 'testusr', true)).to.be.fulfilled
    P2 = await P2.stat()
    expect(`${P2.user}`).to.equal('testusr')
    expect(`${P2.group}`).to.equal('testusr')

    await expect(P1.setUser(process.env.USER, process.env.USER, true)).to.be
      .fulfilled
    P2 = await P2.stat()
    expect(`${P2.user}`).to.equal(process.env.USER)
    expect(`${P2.group}`).to.equal(process.env.USER)

    await P1.delete(true)
    rootShell.close()
  })
  step('can set FS Objects user only (also recursively)', async () => {
    const rootShell = new ShellHarness({
      user: 'root',
      rootPassword: process.env.RPASSWORD,
    })
    await u(`${tstDir}/chownF`, rootShell).delete(true, undefined, true)

    await tstDir.addDirectory(['chownF', 'P2'])

    let P1 = u(`${tstDir}/chownF`, rootShell)
    let P2 = await P1.u('P2')
    await expect(P1.setUser('testusr')).to.be.fulfilled
    P1 = await P1.stat()
    expect(`${P1.user}`).to.equal('testusr')
    expect(`${P1.group}`).to.equal(process.env.USER)

    await expect(P1.setUser('testusr', undefined, true)).to.be.fulfilled
    P2 = await P2.stat()
    expect(`${P2.user}`).to.equal('testusr')
    expect(`${P2.group}`).to.equal(process.env.USER)

    await P1.delete(true)
    rootShell.close()
  })
  step('can set FS Objects group only (also recursively)', async () => {
    const rootShell = new ShellHarness({
      user: 'root',
      rootPassword: process.env.RPASSWORD,
    })

    await u(`${tstDir}/chownG`, rootShell).delete(true, undefined, true)
    await tstDir.addDirectory(['chownG', 'P2'])

    let P1 = u(`${tstDir}/chownG`, rootShell)
    let P2 = await P1.u('P2')
    await expect(P1.setGroup('testusr')).to.be.fulfilled
    P1 = await P1.stat()
    expect(`${P1.user}`).to.equal(process.env.USER)
    expect(`${P1.group}`).to.equal('testusr')

    await expect(P1.setGroup('testusr', true)).to.be.fulfilled
    P2 = await P2.stat()
    expect(`${P2.group}`).to.equal('testusr')

    await expect(P1.setUser(undefined, 'root', true)).to.be.fulfilled
    P2 = await P2.stat()
    expect(`${P2.group}`).to.equal('root')

    await P1.delete(true)
    rootShell.close()
    Server.instance.close()
  })
  describe('run alone', () => {
    after(() => {
      if (Server.instance) Server.instance.close()
    })
    it('can set FS Objects if permission denied and elevator provided', async () => {
      if (Server.instance) await Server.instance.close()
      const server = new Server()
      const rootShell = new ShellHarness({
        user: 'root',
        rootPassword: process.env.RPASSWORD,
      })
      tstDir = u(`${u()}/test`)
      await u(`${tstDir}/chownH`, rootShell).delete(true, undefined, true)
      rootShell.close()

      await tstDir.addDirectory(['chownH', 'P2'])

      let P1 = u(`${tstDir}/chownH`)
      let P2 = await P1.u('P2')
      await expect(P1.setUser('testusr')).to.be.rejectedWith(
        `permission denied: chown: ${process.cwd()}/test/chownH`,
      )
      await expect(P1.setGroup('testusr')).to.be.rejectedWith(
        `permission denied: chgrp: ${process.cwd()}/test/chownH`,
      )

      const elevator = new Elevator(
        async () => new Promise((resolve) => setTimeout(() => resolve(process.env.RPASSWORD), 20)),
      )
      const doneCallback = (cmd, elevatorCmdType) => elevator.elevateIfRequired(cmd, elevatorCmdType)

      server.shell.config.doneCallback = doneCallback

      await expect(P1.setUser('testusr')).to.be.fulfilled
      await expect(P1.setGroup('testusr')).to.be.fulfilled

      P1 = await P1.stat()

      expect(`${P1.user}`).to.equal('testusr')
      expect(`${P1.group}`).to.equal('testusr')

      await expect(P1.setUser('testusr', undefined, true)).to.be.fulfilled
      await expect(P1.setGroup('testusr', true)).to.be.fulfilled

      P2 = await P2.stat()

      expect(`${P2.user}`).to.equal('testusr')
      expect(`${P2.group}`).to.equal('testusr')

      await P1.delete(true)

      server.shell.config.doneCallback = undefined
      elevator.close()
      server.close()
    })
  })
})
