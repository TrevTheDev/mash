/* eslint-disable no-useless-escape */
/* eslint-disable no-unused-expressions */

import chai from 'chai'
import { execSync, spawn } from 'child_process'
import fs, { promises as fsPromises } from 'fs'
import Server, { u } from '../src/server.js'

const { expect } = chai

describe('performance', () => {
  let server
  before(async () => {
    server = new Server({ log: false })
  })
  after(async () => {
    await server.close()
    console.log('done')
  })
  it('performance test 1', async () => {
    let cmd
    const maxTimes = 1000
    const path1 = `${process.cwd()}/package.json`
    // const path2 = `${process.cwd()}/LICENSE`

    const start1 = new Date()
    let fl = await u(path1)
    for (let i = 0; i < maxTimes; i++) {
      // eslint-disable-next-line no-await-in-loop
      cmd = await fl.stat(false, false, false)
      expect(cmd.inode > 0).to.be.true
    }
    console.log(`fsObject.stat: ${(new Date() - start1)}`)
    const start2 = new Date()
    for (let i = 0; i < maxTimes; i++) {
      cmd = fs.statSync(path1)
      expect(cmd.ino > 0).to.be.true
    }
    console.log(`statSync: ${(new Date() - start2)}`)

    const arrayLoop = [...Array(maxTimes).keys()]

    const start3 = new Date()
    const res3 = arrayLoop.map(async () => {
      cmd = await fsPromises.stat(path1)
      expect(cmd.ino > 0).to.be.true
    })
    await Promise.all(res3)
    console.log(`fsPromises.stat: ${(new Date() - start3)}`)

    const start4 = new Date()
    fl = await u(path1)
    const result = arrayLoop.map(async () => {
      cmd = await fl.stat(false, false, false)
      expect(cmd.inode > 0).to.be.true
    })
    await Promise.all(result)
    console.log(`fsObject.stat promise.all: ${(new Date() - start4)}`)
    const start5 = new Date()
    for (let i = 0; i < maxTimes; i++) {
      cmd = execSync(`stat --printf="%a\\0%b\\0%d\\0%F\\0%g\\0%G\\0%h\\0%i\\0%s\\0%t\\0%T\\0%u\\0%U\\0%w\\0%x\\0%y\\0%z\\0%n" -- "${path1}" || { printf "%s" "STATFAILED"; return 1; };`)
      cmd = cmd.toString().split('\0')
      expect(cmd[1] !== undefined).to.be.true
    }
    console.log(`execSync: ${(new Date() - start5)}`)
    const start6 = new Date()
    const spawnPromise = () => new Promise((resolve) => {
      let spnData = ''
      const spwn = spawn('stat', ['--printf="%a\\0%b\\0%d\\0%F\\0%g\\0%G\\0%h\\0%i\\0%s\\0%t\\0%T\\0%u\\0%U\\0%w\\0%x\\0%y\\0%z\\0%n"', path1])
      spwn.stdout.on('data', (data) => {
        spnData += data
      })
      spwn.on('close', () => {
        spnData = spnData.toString().split('\0')
        resolve(spnData)
      })
    })
    for (let i = 0; i < maxTimes; i++) {
      cmd = await spawnPromise()
      expect(cmd[1] !== undefined).to.be.true
    }
    console.log(`spawn: ${(new Date() - start6)}`)
  }).timeout(50000)
})
