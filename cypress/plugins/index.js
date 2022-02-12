module.exports = (on, config) => {
  on('before:browser:launch', (browser = {}, launchOptions) => {
    if (browser.name === 'chrome') {
      launchOptions.args.push('--use-fake-device-for-media-stream')
      launchOptions.args.push(
        '--use-file-for-fake-audio-capture='
          + 'cypress/fixtures/Mindseye - Interstellar (90sec mic record).wav')
    }
    return launchOptions
  })
}
