import KeyFinderWorker from 'key-finder-wasm?worker';

export function initializeKeyFinder({
  sampleRate,
  numberOfChannels,
}: {
  sampleRate: number;
  numberOfChannels: number;
}) {
  const worker = new KeyFinderWorker();
  worker.postMessage({
    funcName: 'initialize',
    data: [sampleRate, numberOfChannels],
  });
  return worker;
}

export function extractResultFromByteArray(byteArray: number[]) {
  return byteArray.reduce(
    (acc, cur) => `${acc}${String.fromCharCode(cur)}`,
    ''
  );
}

export function zipChannelsAtOffset(
  channelData: Float32Array[],
  offset: number,
  sampleRate: number,
  numberOfChannels: number
) {
  const segment = new Float32Array(sampleRate * numberOfChannels);
  for (let i = 0; i < sampleRate; i += 1) {
    for (let j = 0; j < numberOfChannels; j += 1) {
      segment[i + j] = channelData[j][offset + i];
    }
  }
  return segment;
}
