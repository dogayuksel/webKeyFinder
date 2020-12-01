import { h, Fragment, Component } from 'preact';
import { audioUtils, keyFinderUtils } from '../Utils';

class LiveDetection extends Component {
  audioContext: AudioContext | null = null;
  recorder: AudioWorkletNode | null = null;
  analyzer: Worker | null = null;
  sampleRate: number | null = null;

  state = {
    connected: false,
    analyzing: false,
    result: null,
    error: null,
  };

  routeSound = async () => {
    try {
      const stream = await audioUtils.requestUserMedia();
      this.audioContext = audioUtils.createAudioContext();
      const source = audioUtils.createAudioSource(this.audioContext, stream);
      this.sampleRate = audioUtils.getSourceMeta(source).sampleRate;
      this.recorder = await audioUtils.createRecordingDevice(this.audioContext);
      audioUtils.connectSourceToRecorder(source, this.recorder);

      this.setState({ connected: true });

      this.recorder.port.onmessage = (e) => {
        if (e.data.eventType === 'data') {
          const audioData = e.data.audioBuffer;
          this.analyzer && this.analyzer.postMessage({
            funcName: 'feedAudioData',
            data: [audioData],
          });
        }
        if (e.data.eventType === 'stop') {
          this.analyzer && this.analyzer.postMessage({ funcName: 'finalDetection' });
        }
      }
    } catch(e) {
      this.setState({ error: e.message });
    }
  }

  connectAnalyzer = () => {
    this.analyzer = keyFinderUtils.initializeKeyFinder({
      sampleRate: this.sampleRate,
      numberOfChannels: 1
    });
    this.analyzer.addEventListener('message', (event) => {
      if (event.data.finalResponse) {
        const result = keyFinderUtils.extractResultFromByteArray(event.data.data)
        this.setState({ result });
      } else { // Not final response
        if (event.data.data === 0) { // very first response
          console.log("Analyzer is initialized");
          this.setState({ analyzing: true })
        } else { // not first response
          const result = keyFinderUtils.extractResultFromByteArray(event.data.data);
          this.setState({ result });
        }
      }
    });
  }

  startRecording = () => {
    if (!this.recorder || !this.audioContext) return;
    this.connectAnalyzer();
    const { contextTime } = this.audioContext.getOutputTimestamp();
    this.recorder.parameters.get('isRecording').setValueAtTime(1, contextTime + 0.1);
    this.setState({  result: "..." });
  }

  stopRecording = () => {
    if (!this.recorder || !this.audioContext) return;
    this.setState({ analyzing: false });
    const { contextTime } = this.audioContext.getOutputTimestamp();
    this.recorder.parameters.get('isRecording').setValueAtTime(0, contextTime + 0.1);
  }

  render ({}, { connected, analyzing, result, error }) {
    return (
      <>
        {error && <h1>{error}</h1>}
        <h1>Live Key Detection</h1>
        <input
          type="button"
          onClick={this.routeSound}
          value={
            connected
              ? "Key detection engine running"
              : "Route sound to key detection engine"
          }
          disabled={connected}
        />
        <input
          type="button"
          onClick={this.startRecording}
          value="Start Key Detection"
          disabled={!connected || analyzing}
        />
        <input
          type="button"
          onClick={this.stopRecording}
          value="End Key Detection"
          disabled={!analyzing}
        />
        <div>
          {result && `${analyzing ? "Progressive" : "Final"} Result: ${result}`}
        </div>
      </>
    );
  }
}

export default LiveDetection;
