/* eslint-disable no-useless-escape */
/* eslint-disable no-unused-expressions */

import chai from 'chai'
import { execSync } from 'child_process'
import fs, { promises as fsPromises } from 'fs'
import Server, { u } from '../src/server.js'
import { FsObjectPromisePathed } from '../src/locations/fs objects.js'
import { PathContainer } from '../src/locations/path.js'
// import FsObjectBasic from '../src/locations/mixins/basics.js'
// import FsObjectCommon from '../src/locations/mixins/common.js'
// import FileBase from '../src/locations/mixins/file base.js'
// import DirectoryBase from '../src/locations/mixins/directory base.js'
// import FsObjectPromisePathed from '../src/locations/oldtypes/fs object promise pathed.js'
// import FsObjectPromise from '../src/locations/oldtypes/fs object promise.js'
// import { File, Directory } from '../src/locations/fs objects.js'
// import { PathContainer } from '../src/locations/path.js'
// import Directory from '../src/locations/oldtypes/directory.js'

const { expect } = chai

describe('performance', () => {
  let server
  before(async () => {
    server = new Server({ log: false })
  })
  after(() => {
    server.close()
  })
  it("u('sss').content", async () => {
    // const basic = new FsObjectBasic()
    // const common = new FsObjectCommon()
    // const fileBase = new FileBase()
    // const dirBase = new DirectoryBase()
    const pathedFsObjectPromise = new FsObjectPromisePathed(server.executionContext, new PathContainer(server.executionContext, `${process.cwd()}/package.json`))
    const data = await pathedFsObjectPromise.read()
    console.log(data)

    // const fsObjectPromise = new FsObjectPromise()
    // const file = new File()
    // const directory = new Directory()
    const uObj = u()
    const fsObj = await uObj
    const statObj = await fsObj.stat()
    const result2 = statObj.accessRights
    // const result = await arpms
    console.log(result2)
  })
  it("u('./path/to/dir').content", async () => {
    const content = await u(`${cwd}`).content
    expect(content.constructor.name).to.equal('FSObjectArray')
  })
  it('performance test 1', async () => {
    let cmd
    let flip = true
    const maxTimes = 10000
    const path1 = `${process.cwd()}/package.json`
    const path2 = `${process.cwd()}/LICENSE`
    const ec = server.executionContext
    const pth1 = new PathContainer(ec, undefined, path1)
    const pth2 = new PathContainer(ec, undefined, path2)
    const start1 = new Date()
    for (let i = 0; i < maxTimes; i++) {
      // eslint-disable-next-line no-await-in-loop
      const fl = new FsObjectCommon(ec, flip ? pth1 : pth2)
      cmd = await fl.stat(false, false, false)
      expect(cmd.inode > 0).to.be.true
      flip = !flip
    }
    console.log((new Date() - start1))
    const start2 = new Date()
    for (let i = 0; i < maxTimes; i++) {
      cmd = fs.statSync(flip ? path1 : path2)
      expect(cmd.ino > 0).to.be.true
      flip = !flip
    }
    console.log((new Date() - start2))

    const arrayLoop = [...Array(maxTimes).keys()]

    const start3 = new Date()
    const res3 = arrayLoop.map(async () => {
      cmd = await fsPromises.stat(flip ? path1 : path2)
      expect(cmd.ino > 0).to.be.true
      flip = !flip
    })
    const res3out = await Promise.all(res3)
    console.log((new Date() - start3))

    const start4 = new Date()
    const result = arrayLoop.map(async () => {
      const fl = new FsObjectCommon(ec, flip ? pth1 : pth2)
      cmd = await fl.stat(false, false, false)
      expect(cmd.inode > 0).to.be.true
      flip = !flip
    })
    const outcome = await Promise.all(result)
    console.log((new Date() - start4))
  }).timeout(50000)
})
