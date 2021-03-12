import { h, createRef, Fragment, Component } from 'preact';
import { audioUtils, keyFinderUtils } from '../Utils';
import CircleOfFifths from './CircleOfFifths';
import { keysNotation } from '../defaults';

const WIDTH = 200;
const HEIGHT = 100;

class LiveDetection extends Component {
  audioContext: AudioContext | null = null;
  recorder: AudioWorkletNode | null = null;
  levelAnalyzer: AudioAnalyzerNode | null = null;
  keyAnalyzer: Worker | null = null;
  sampleRate: number | null = null;
  canvas = createRef(); 
  canvasContext = null;
  dataArray = null;

  state = {
    connected: false,
    analyzing: false,
    result: null,
    error: null,
  };

  drawLevelAnalysis = () => {
    requestAnimationFrame(this.drawLevelAnalysis);
    this.levelAnalyzer.getByteTimeDomainData(this.dataArray);
    this.canvasContext.fillStyle = '#EBECEC';
    this.canvasContext.fillRect(0, 0, WIDTH, HEIGHT);
    this.canvasContext.lineWidth = 2;
    this.canvasContext.strokeStyle = '#FF6801';
    this.canvasContext.beginPath();
    const bufferLength = this.levelAnalyzer.frequencyBinCount;

    var sliceWidth = WIDTH * 1.0 / bufferLength;
    let x = 0;
    for(let i = 0; i < bufferLength; i++) {
      let v = this.dataArray[i] / 128.0;
      let y = v * HEIGHT/2;
      if (i === 0) {
        this.canvasContext.moveTo(x, y);
      } else {
        this.canvasContext.lineTo(x, y);
      }
      x += sliceWidth;
    }
    this.canvasContext.lineTo(WIDTH, HEIGHT/2);
    this.canvasContext.stroke();
  };

  routeSound = async () => {
    try {
      const stream = await audioUtils.requestUserMedia();
      this.audioContext = audioUtils.createAudioContext();
      const source = audioUtils.createAudioSource(this.audioContext, stream);
      this.sampleRate = audioUtils.getSourceMeta(source).sampleRate;

      this.recorder = await audioUtils.createRecordingDevice(this.audioContext);
      this.levelAnalyzer = audioUtils.createAnalyserDevice(this.audioContext);
      this.dataArray = audioUtils.createDataArrayForAnalyzerDevice(this.levelAnalyzer);
      this.canvasContext = this.canvas.current.getContext("2d");

      audioUtils.connectAudioNodes(source, this.recorder);
      audioUtils.connectAudioNodes(source, this.levelAnalyzer);

      this.drawLevelAnalysis();

      this.setState({ connected: true });

      this.recorder.port.onmessage = (e) => {
        if (e.data.eventType === 'data') {
          const audioData = e.data.audioBuffer;
          this.keyAnalyzer && this.keyAnalyzer.postMessage({
            funcName: 'feedAudioData',
            data: [audioData],
          });
        }
        if (e.data.eventType === 'stop') {
          this.keyAnalyzer && this.keyAnalyzer.postMessage({ funcName: 'finalDetection' });
        }
      }
    } catch(e) {
      this.setState({ error: e.message });
    }
  }

  connectKeyAnalyzer = () => {
    this.keyAnalyzer = keyFinderUtils.initializeKeyFinder({
      sampleRate: this.sampleRate,
      numberOfChannels: 1
    });
    this.keyAnalyzer.addEventListener('message', (event) => {
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
    this.connectKeyAnalyzer();
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
        <header>
          <h1>Live Key Detection</h1>
        </header>
        <main
          style={{
            paddingTop: '1em',
            display: 'grid',
            gridTemplateColumns: '1fr 2fr',
          }}
        >
          <div>
            <div style={{ paddingBottom: '2em' }}>
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
            </div>
            <div style={{ paddingBottom: '2em' }}>
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
            </div>
            <div>
              <canvas
                width={WIDTH}
                height={HEIGHT}
                ref={this.canvas}
                style={{ width: WIDTH, height: HEIGHT, margin: '1em' }}
              />
            </div>
            <div style={{ height: '2rem' }}>
              {result && `${analyzing ? "Progressive" : "Final"} Result: ${keysNotation[result] || result}`}
            </div>
          </div>
          <div>
            <CircleOfFifths result={result} />
          </div>
        </main>
      </>
    );
  }
}

export default LiveDetection;
