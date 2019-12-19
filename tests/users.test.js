import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import chaiArrays from 'chai-arrays'
import Server from '../src/server.js'

chai.use(chaiAsPromised)
chai.use(chaiArrays)

const {expect} = chai

describe('users', () => {
  let server
  let users
  before(async () => {
    server = Server.instance || new Server()
    ;({users} = server)
  })

  after(() => {
    server.close()
  })

  it('returns current user', async () => {
    let user = await expect(users.getUser()).to.be.fulfilled
    expect(user.name).to.equal(`${process.env.USER}`)
    expect(user.effectiveGroup.gid).to.equal(process.getgid())
    expect(user.uid).to.equal(process.getuid())
    user = await expect(users.getUser(process.getuid())).to.be.fulfilled
    expect(user.uid).to.equal(process.getuid())
    expect(user.effectiveGroup.gid).to.equal(process.getgid())
    user = await expect(users.currentUser).to.be.fulfilled
    expect(user.uid).to.equal(process.getuid())
    const group = await expect(users.currentGroup).to.be.fulfilled
    expect(group.gid).to.equal(process.getgid())
  })
  it('returns throws if user does not exist', async () => {
    await expect(users.getUser('doesNotExist')).to.be.rejectedWith(
      'user not found: id: doesNotExist'
    )
  })
})
