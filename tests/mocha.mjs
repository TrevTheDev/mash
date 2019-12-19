import path from 'path'
import Mocha from 'mocha'

Mocha.prototype.loadFiles = async function(fn) {
  var self = this
  var suite = this.suite
  for await (let file of this.files) {
    file = path.resolve(file)
    suite.emit('pre-require', global, file, self)
    suite.emit('require', await import(file), file, self)
    suite.emit('post-require', global, file, self)
  }
  fn && fn()
}

Mocha.prototype.run = async function(fn) {
  if (this.files.length) await this.loadFiles()

  var suite = this.suite
  var options = this.options
  options.files = this.files
  var runner = new Mocha.Runner(suite, options.delay)
  var reporter = new this._reporter(runner, options)

  function done(failures) {
    if (reporter.done) {
      reporter.done(failures, fn)
    } else {
      fn && fn(failures)
    }
  }

  runner.run(done)
}

let mocha = new Mocha({ui: 'tdd', reporter: 'list'})
process.argv.slice(2).forEach(mocha.addFile.bind(mocha))
mocha.run(failures => {
  process.exitCode = failures ? -1 : 0
})
