/* eslint-disable mocha/no-setup-in-describe */
/* eslint-disable mocha/no-hooks-for-single-case */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import Server, { u, ShellHarness } from '../src/server.js'
import Elevator from '../src/parsers/elevator.js'

chai.use(chaiAsPromised)

const { expect } = chai

describe('root / different user', () => {
  before(async () => {
    if (Server.instance) await Server.instance.close()
  })

  step('provides a root shell', async () => {
    const server = new Server({
      shell: {
        numberOfProcesses: 5,
        user: 'root',
        rootPassword: process.env.RPASSWORD,
      },
    })
    const whoAmITst = await server.users.getUser()
    expect(`${whoAmITst}`).to.equal('root')
    expect(server.shell.config.rootPassword).to.not.exist
    await server.close()
  })
  step('provides a different user shell', async () => {
    const server = new Server({
      shell: {
        numberOfProcesses: 1,
        user: 'testusr',
        rootPassword: process.env.RPASSWORD,
      },
    })
    const whoami = await server.users.getUser()
    expect(`${whoami}`).to.equal('testusr')
    await server.close()
  })
  step('can have multiple user shells', async () => {
    const server = new Server()
    const rootShell = new ShellHarness({
      user: 'root',
      rootPassword: process.env.RPASSWORD,
    })
    const tstDir = await u('./test').addDirectory('rootTestDir', true)
    await u(`${tstDir}`, rootShell).delete(true)

    const rtstDir = u(
      `${await u('./test').addDirectory('rootTestDir', true)}`,
      rootShell,
    )
    const rO = await rtstDir.addDirectory('rootOnly')
    expect(`${await rO.user}`).to.equal('root')
    await rtstDir.delete(true)
    await rootShell.close()
    await server.close()
  })

  step('fails if user does not exist', async () => {
    const server = new Server({
      shell: {
        user: 'doesNotExist',
        rootPassword: process.env.RPASSWORD,
      },
    })
    const usr = server.users.getUser()
    await expect(usr).to.be.rejectedWith(
      'login failed: su: user doesNotExist does not exist',
    )
    await server.close()
  })
  step('fails if wrong password is provided', async () => {
    const server = new Server({
      shell: {
        user: 'root',
        rootPassword: 'wrongPassword',
      },
    })
    await expect(server.users.getUser()).to.be.rejected
    await server.close()
  })
  step('provides a root elevator', async () => {
    let server = new Server({
      shell: {
        user: 'root',
        rootPassword: process.env.RPASSWORD,
      },
    })
    let tstDir = await u('./test').addDirectory('rootTest2', true)
    await tstDir.delete(true)
    tstDir = await u('./test').addDirectory(['rootTest2', 'D1'], true)

    expect(`${await tstDir[0].user}`).to.equal('root')
    await server.close()

    server = new Server()

    const elevator = new Elevator(
      async () => new Promise((resolve) => setTimeout(() => resolve(process.env.RPASSWORD), 20)),
    )

    const doneCallback = (cmd, elevatorCmdType) => elevator.elevateIfRequired(cmd, elevatorCmdType)

    tstDir = u('test/rootTest2/D1')
    await expect(tstDir.delete(true)).to.be.rejected

    server.shell.config.doneCallback = doneCallback
    await expect(tstDir.delete(true)).to.be.fulfilled
    expect(await u('test/rootTest2/D1').exists).to.be.false
    await u('test/rootTest2').delete(true)
    await elevator.close()
    await server.close()
  })
})
