/* eslint-disable no-useless-escape */
/* eslint-disable no-unused-expressions */

import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import Server, {ShellHarness, u, sh} from './server'

chai.use(chaiAsPromised)

const {expect} = chai

describe('example code', () => {
  before(() => {
    if (Server.instance) Server.instance.close()
  })
  after(() => {
    if (Server.instance) Server.instance.close()
  })
  step('executes example code', async () => {
    // if (Server.instance) Server.instance.close()
    const server = new Server()
    const pwd = u()
    const tstDir = u(`${pwd}/test`)

    await u(`${tstDir}/examples`).delete(true, undefined, true)

    const workingDirs = await tstDir.addDirectory(
      ['examples', 'another dir'],
      true
    )

    // think of u as being similar to a url bar except for the filesystem
    const someDir = u(`./test/examples`)
    const res = await someDir
    expect(`${res}`).to.equal(`${workingDirs[0]}`)

    // if no path is supplied it defaults to the current working directory - pwd
    const cwd = u()
    expect(`${cwd}`).to.equal(`${process.cwd()}`)

    // console.log(`${cwd}`) // /path/to/current/working/directory

    // creates a newFile in `some/dir` with content 'ABC'
    const newFile = await u(`./test/examples`).addFile('newFile.txt', 'ABC')
    expect(await newFile.exists).to.be.true
    expect(await newFile.read()).to.equal('ABC')

    const findIt = await u(`./test/examples`)
      .find.byName('newFile')
      .byExt('txt')
      .smallerThan('100kB')
    expect(`${findIt[0]}`).to.equal(`${newFile}`) // some/dir/newFile.txt

    // stat, gio, lsattr newFile
    await newFile.stat()
    expect(newFile.loadedStat).to.be.true
    expect(newFile.loadedGio).to.be.true
    expect(newFile.loadedLsattr).to.be.true

    // console.log(`${newFile.user}`) // someuser
    expect(`${newFile.user}`).to.equal(`${process.env.USER}`)

    const content = await newFile.read() // returns 'ABC'
    expect(content).to.equal(`ABC`)

    // copies NewFile
    const copiedFile = await newFile.copyTo('./test/examples/another dir')
    expect(await u(`${copiedFile}`).exists).to.be.true

    // deletes newFile
    await newFile.delete()
    expect(await u(`./test/examples/newFile.txt`).exists).to.be.false

    // moves copied file to trash
    await u(`./test/examples/another dir/${copiedFile.path.base}`).trash()
    expect(await u(`./test/examples/another dir/newFile.txt`).exists).to.be
      .false

    console.log(JSON.stringify(await u().content))

    // run any shell command
    const cmd = await sh('echo HELLO;')
    // console.log(cmd.output) // HELLO\n
    expect(cmd.output).to.equal('HELLO\n')

    server.close() // shuts down all active shell processes
  })
  step('Interact with shell', async () => {
    const server = new Server()
    const cmd = server.shell.interact(
      'echo "what is your name?" ; read name;\n'
    )
    cmd.on('data', stdout => {
      if (stdout === 'what is your name?\n') {
        cmd.stdin.write('Bob\necho $name\n')
        cmd.sendDoneMarker() // required to indicate that this interaction is completed
      } else {
        // console.log(stdout) // `Bob\n`
        expect(stdout).to.equal(`Bob\n`)
      }
    })
    const res = await cmd
    // console.log(res.output) // `what is your name?\nBob\n`
    expect(res.output).to.equal(`what is your name?\nBob\n`)
    server.close()
  })
  step('Get a root or other user shell', async () => {
    // import {ShellHarness} from '@trevthedev/mash'

    const rootShell = new ShellHarness({
      user: 'root', // or other user
      rootPassword: process.env.RPASSWORD
    })
    const res = await rootShell.createCommand('whoami;')
    // console.log(res.output) // 'root\n'
    expect(res.output).to.equal('root\n')

    rootShell.close()
    // or
    if (Server.instance) Server.instance.close()

    const rootServer = new Server({
      shell: {
        user: 'root', // or other user
        rootPassword: process.env.RPASSWORD
      }
    })
    const whoami = await sh('whoami;')
    expect(whoami.output).to.equal('root\n')
    rootServer.close()
  })
  step('Intercept and replace output', async () => {
    const server = new Server()

    const cb = (cmd, cbData) => {
      console.log(cbData) // 'HIT'
      expect(cbData).to.equal('HIT')
      return true
    }
    // console.log(await sh('printf HELLO ;', 'HIT', cb)) // true
    server.close() // clean up

    const callBackServer = new Server({
      shell: {
        doneCallback: cb
      }
    })

    // console.log(await sh('printf HELLO ;', 'HIT')) // true
    callBackServer.close()
  })
  step('Receive data via IPC', async () => {
    const server = new Server()

    const cmd = server.shell.interact(
      'printf "{\\"ipc\\": \\"true\\"}\\n" 1>&$NODE_CHANNEL_FD ; printf HELLO ; \n'
    )
    cmd.on('message', data => {
      // console.log(data) // { ipc: "true" }
      expect(data.ipc).to.equal('true')
      cmd.sendDoneMarker()
    })
    const res = await cmd
    // console.log(res.output) // `HELLO`
    expect(res.output).to.equal('HELLO')
    server.close()
  })
  step('Send data via IPC', async () => {
    const server = new Server()

    const cmd = server.shell.interact('echo ; \n')

    cmd.on('data', stdout => {
      if (stdout === '\n') {
        cmd.sendMessage('HELLOBOB')
        cmd.stdin.write('read -r line <&3 ; printf $line ; \n')
        cmd.sendDoneMarker() // required to finalise cmd
      }
    })
    const res = await cmd
    // console.log(res.output) // \n"HELLOBOB"`
    expect(res.output).to.equal('\n"HELLOBOB"')

    server.close()
  })
})
