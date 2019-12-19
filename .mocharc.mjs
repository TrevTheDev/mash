import Mocha from 'mocha'

export default {
  diff: true,
  extension: ['js'],
  opts: ['-r', 'mocha-steps'],
  package: './package.json',
  reporter: 'spec',
  slow: 1000,
  timeout: 60000,
  require: 'mocha-steps',
  ui: 'bdd',
  file: Mocha.utils.lookupFiles('tests/**/*.test.js'),
  'watch-files': ['tests/**/*.test.js'],
  'watch-ignore': ['lib/vendor']
}
