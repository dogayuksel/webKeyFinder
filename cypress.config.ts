import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      on('before:browser:launch', (browser = {}, launchOptions) => {
        launchOptions.args.push('--use-fake-device-for-media-stream')
        launchOptions.args.push(
          '--use-file-for-fake-audio-capture='
            + 'cypress/fixtures/Mindseye - Interstellar (90sec mic record).wav')
        return launchOptions
      });
    },
  },
})
