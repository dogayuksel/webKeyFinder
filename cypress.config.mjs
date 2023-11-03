import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on('before:browser:launch', (browser = {}, launchOptions) => {
        // chrome rejects mic permissions on non-https
        launchOptions.args.push('--no-sandbox');
        launchOptions.args.push('--use-fake-device-for-media-stream');
        launchOptions.args.push(
          '--use-file-for-fake-audio-capture=' +
            'cypress/fixtures/Mindseye - Interstellar (90sec mic record).wav'
        );
        return launchOptions;
      });
    },
  },
});
