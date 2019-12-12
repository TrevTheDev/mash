module.exports = () => {
  return {
    files: ['src/**/*.js'],
    tests: ['src/**/*.test.js'],
    env: {
      type: 'node',
      params: {
        runner: `-r ${require.resolve('esm')} -r ${require.resolve(
          'mocha-steps'
        )}`
      }
    }
  }
}
