import keyFinderWorkerURL from 'omt:key-finder-wasm';

export function initializeKeyFinder({ sampleRate, numberOfChannels }) {
  const worker = new Worker(keyFinderWorkerURL);
  worker.postMessage({
    funcName: 'initialize',
    data: [sampleRate, numberOfChannels],
  });
  return worker;
}

export function extractResultFromByteArray(byteArray) {
  return byteArray.reduce(
    (acc, cur) => `${acc}${String.fromCharCode(cur)}`,
    ''
  );
}

export function zipChannelsAtOffset(
  channelData,
  offset,
  sampleRate,
  numberOfChannels
) {
  const segment = new Float32Array(sampleRate * numberOfChannels);
  for (let i = 0; i < sampleRate; i += 1) {
    for (let j = 0; j < numberOfChannels; j += 1) {
      segment[i + j] = channelData[j][offset + i];
    }
  }
  return segment;
}
