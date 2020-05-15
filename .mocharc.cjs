module.exports = {
  require: './node_modules/mocha-steps',
  slow: 1000,
  timeout: 600000,
  spec: 'tests/**/*.test.js',
  watchFiles: ['tests/**/*.test.js']
}
