/* eslint-disable no-unused-expressions */

import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
// import {u} from '../server'
// import {ChainablePromise} from '../util/utils'
// import Promse from '../util/promse'

chai.use(chaiAsPromised)

const {expect} = chai

describe('find', () => {
  // let tstDir
  // before(async () => {
  //   if (Server.instance) Server.instance.close()
  //   const cwd = u()
  //   tstDir = await cwd.addDirectory('test', true)
  // })
  // after(() => {
  //   if (Server.instance) Server.instance.close()
  // })
  // it('can build a find string', async () => {
  //   const bp = new ChainablePromise(resolve => {
  //     setTimeout(() => {
  //       resolve(
  //         {
  //           a(val) {
  //             return new ChainablePromise(result =>
  //               setTimeout(() => result({b: val}), 5000)
  //             )
  //           }
  //         },
  //         5000
  //       )
  //     })
  //   })
  //   const rbr = await bp.a('YELLO').b()
  //   console.log(rbr)
  //   const cwd = await u()
  // let FB = cwd.find.byName('yes sir').toString()
  // console.log(FB)
  // FB = cwd.find.byName('package').toString()
  // console.log(FB)
  // FB = cwd.find
  //   .byName('package')
  //   .byExt('.json')
  //   .toString()
  // console.log(FB)
  // const usr = await Server.instance.users.currentUser
  // const grp = await Server.instance.users.currentGroup
  // FB = cwd.find
  //   .byName('package')
  //   .byExt('.JSON')
  //   .byRegEx('/asc/')
  //   .ignoreCase()
  //   .byInode(123)
  //   .byType(FILE_TYPE_ENUMS.file)
  //   .isDirectory()
  //   .isFile()
  //   .isSymlink()
  //   .biggerThan('1B')
  //   .smallerThan('200kB')
  //   .isEmpty()
  //   .modifiedWithin(60)
  //   .modifiedAtLeast(60)
  //   .accessedWithin(60)
  //   .accessedAtLeast(60)
  //   .metaDataModifiedWithin(60)
  //   .metaDataModifiedAtLeast(60)
  //   .byGroup(grp)
  //   .byGID(1002)
  //   .hasNoGroup()
  //   .byUser(usr)
  //   .byUID(1001)
  //   .hasNoUser()
  //   .ignoreSubdirectories()
  //   .isExecutable()
  //   .isReadable()
  //   .isWritable()
  // const str1 = FB.toString()
  // const nf = cwd.find.options({
  //   atLeastMatchPermissions: undefined,
  //   biggerThan: 1,
  //   caseInsensitive: true,
  //   contentLastModifiedMinutesAgo: '+60',
  //   ext: '.JSON',
  //   gid: 1002,
  //   group: grp,
  //   hasNoGroup: false,
  //   hasNoUser: true,
  //   inodeNumber: 123,
  //   isExecutable: true,
  //   isReadable: true,
  //   isWritable: true,
  //   lastAccessedMinutesAgo: '+60',
  //   maxDepthToSearch: 1,
  //   metaDataLastModifiedMinutesAgo: '+60',
  //   name: 'package',
  //   onlyIfEmptyFileOrDir: true,
  //   regex: '/asc/',
  //   smallerThan: 200000,
  //   type: FILE_TYPE_ENUMS.symbolicLink,
  //   uid: 1001,
  //   user: usr
  // })
  // expect(str1).to.equal(nf.toString())
  // const x = cwd.find
  //   .byName('package')
  //   .byExt('json')
  //   .ignoreCase()
  //   .ignoreSubdirectories()
  // console.log(x.toJSON())
  //   const pms = {
  //     pms: new Promise(resolve => {
  //       resolve({
  //         a: () => {
  //           return new Promise(result => {
  //             result({
  //               b() {
  //                 return true
  //               }
  //             })
  //           })
  //         }
  //       })
  //     }),
  //     async then(resolve) {
  //       const res = await this.pms
  //       resolve(res)
  //     },
  //     a() {
  //       const pms1 = new Promise(resolve => {
  //         this.then(result => {
  //           resolve(result.a())
  //         })
  //       })
  //       const obj = {
  //         async b() {
  //           const resl = await pms1
  //           return resl.b()
  //         }
  //       }
  //       return obj
  //     }
  //   }
  //   console.log('a')
  //   const x = await pms.a().b()
  //   const res = u()
  //   // res = await res
  //   const findResult = await res.find.byName('wallaby').byExt('.js')
  //   console.log(findResult.toString())
  // })
})
