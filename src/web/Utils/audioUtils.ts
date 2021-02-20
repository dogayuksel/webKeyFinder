import recorderWorkletURL from "omt:../recorderWorkletProcessor.js";

export function requestUserMedia(): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({ audio: true, video: false });
}

export function createAudioContext(): AudioContext {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  return new AudioContext();
}

export function createAudioSource(
  audioContext: AudioContext,
  stream: MediaStream
): MediaStreamAudioSourceNode {
  return audioContext.createMediaStreamSource(stream);
}

export function getSourceMeta(
  audioSource: MediaStreamAudioSourceNode
): { numberOfChannels: number, sampleRate: number } {
  return ({
    numberOfChannels: audioSource.channelCount, 
    sampleRate: audioSource.context.sampleRate,
  });
}

export function createRecordingDevice(audioContext: AudioContext): Promise<AudioWorkletNode> {
  return new Promise((resolve, reject) => {
    audioContext.audioWorklet.addModule(recorderWorkletURL).then(() => {
      const recorder = new AudioWorkletNode(audioContext, 'recorder-worklet');
      resolve(recorder);
    }).catch(e => { reject(e); });
  });
}

export function createAnalyserDevice(audioContext: AudioContext): AudioAnalyzerNode {
  const analyzer = audioContext.createAnalyser();
  analyzer.fftSize = 2048;
  return analyzer;
}

export function createDataArrayForAnalyzerDevice(analyzer: AudioAnalyzerNode): Uint8Array {
  const bufferLength = analyzer.frequencyBinCount;
  var dataArray = new Uint8Array(bufferLength);
  analyzer.getByteTimeDomainData(dataArray);
  return dataArray;
}

export function connectAudioNodes(audioSource: AudioNode, audioRecorder: AudioNode): void {
  audioSource.connect(audioRecorder);
}
