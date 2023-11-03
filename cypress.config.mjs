import { defineConfig } from 'cypress';

export default defineConfig({
  video: true,
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      on('before:browser:launch', (browser = {}, launchOptions) => {
        launchOptions.args.push('--use-fake-ui-for-media-stream');
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
