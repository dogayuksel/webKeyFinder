import recorderWorkletURL from "omt:../recorderWorkletProcessor.js";

export function requestUserMedia(): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({ audio: true, video: false });
}

export function createAudioContext(): AudioContext {
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

export function connectSourceToRecorder(audioSource, audioRecorder) {
  audioSource.connect(audioRecorder);
}
