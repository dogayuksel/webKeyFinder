import { createRef, Component } from 'preact';
import { audioUtils, keyFinderUtils } from '../Utils';
import CircleOfFifths from '../CircleOfFifths';
import { keysNotation } from '../defaults';
import theme from '../theme';

import './LiveDetection.css';

const WIDTH = 200;
const HEIGHT = 100;

interface State {
  connected: boolean;
  analyzing: boolean;
  result: string | null;
  error: string | null;
}

class LiveDetection extends Component<{}, State> {
  audioContext: AudioContext | null = null;
  recorder: RecorderWorkletNode | null = null;
  levelAnalyzer: AudioAnalyzerNode | null = null;
  keyAnalyzer: Worker | null = null;
  sampleRate: number | null = null;
  canvas = createRef<HTMLCanvasElement>();
  canvasContext: CanvasRenderingContext2D | null = null;
  dataArray: Uint8Array | null = null;

  state = {
    connected: false,
    analyzing: false,
    result: null,
    error: null,
  };

  componentDidMount() {
    document.title = 'keyfinder | Key Finder for Live Audio';
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        'content',
        'A web application to find the musical key (root note) of a song from the live audio feed. Analyze audio from your microphone or audio stream routed from your sound card to find the root note right in your browser.'
      );
  }

  componentWillUnmount() {
    this.keyAnalyzer && this.keyAnalyzer.terminate();
  }

  drawLevelAnalysis = () => {
    if (!this.levelAnalyzer || !this.canvasContext || !this.dataArray) return;
    requestAnimationFrame(this.drawLevelAnalysis);
    this.levelAnalyzer.getByteTimeDomainData(this.dataArray);
    this.canvasContext.fillStyle = theme.colors['--gray-color'];
    this.canvasContext.fillRect(0, 0, WIDTH, HEIGHT);
    this.canvasContext.lineWidth = 2;
    this.canvasContext.strokeStyle = theme.colors['--secondary-color'];
    this.canvasContext.beginPath();
    const bufferLength = this.levelAnalyzer.frequencyBinCount;

    var sliceWidth = (WIDTH * 1.0) / bufferLength;
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      let v = this.dataArray[i] / 128.0;
      let y = (v * HEIGHT) / 2;
      if (i === 0) {
        this.canvasContext.moveTo(x, y);
      } else {
        this.canvasContext.lineTo(x, y);
      }
      x += sliceWidth;
    }
    this.canvasContext.lineTo(WIDTH, HEIGHT / 2);
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
      this.dataArray = audioUtils.createDataArrayForAnalyzerDevice(
        this.levelAnalyzer
      );
      this.canvasContext = this.canvas.current?.getContext('2d') ?? null;

      audioUtils.connectAudioNodes(source, this.recorder);
      audioUtils.connectAudioNodes(source, this.levelAnalyzer);

      this.drawLevelAnalysis();

      this.setState({ connected: true });

      this.recorder.port.onmessage = (e) => {
        if (e.data.eventType === 'data') {
          const audioData = e.data.audioBuffer;
          this.keyAnalyzer &&
            this.keyAnalyzer.postMessage({
              funcName: 'feedAudioData',
              data: [audioData],
            });
        }
        if (e.data.eventType === 'stop') {
          this.keyAnalyzer &&
            this.keyAnalyzer.postMessage({ funcName: 'finalDetection' });
        }
      };
    } catch (e) {
      if (e instanceof Error) {
        this.setState({ error: e.message ?? 'Unknown error' });
      } else {
        throw e;
      }
    }
  };

  connectKeyAnalyzer = () => {
    if (!this.sampleRate) {
      throw new Error('Unexpected missing sample rate');
    }
    this.keyAnalyzer = keyFinderUtils.initializeKeyFinder({
      sampleRate: this.sampleRate,
      numberOfChannels: 1,
    });
    this.keyAnalyzer.addEventListener('message', (event) => {
      if (event.data.finalResponse) {
        const result = keyFinderUtils.extractResultFromByteArray(
          event.data.data
        );
        this.setState({ result });
        this.keyAnalyzer && this.keyAnalyzer.terminate();
      } else {
        // Not final response
        if (event.data.data === 0) {
          // very first response
          console.log('Analyzer is initialized');
          this.setState({ analyzing: true });
        } else {
          // not first response
          const result = keyFinderUtils.extractResultFromByteArray(
            event.data.data
          );
          this.setState({ result });
        }
      }
    });
  };

  startRecording = () => {
    if (!this.recorder || !this.audioContext) return;
    this.connectKeyAnalyzer();
    const { contextTime } = this.audioContext.getOutputTimestamp();
    if (!contextTime) {
      throw new Error('Unexpected undefined context time');
    }
    this.recorder.parameters
      .get('isRecording')
      .setValueAtTime(1, contextTime + 0.1);
    this.setState({ result: '...' });
  };

  stopRecording = () => {
    if (!this.recorder || !this.audioContext) return;
    this.setState({ analyzing: false });
    const { contextTime } = this.audioContext.getOutputTimestamp();
    if (!contextTime) {
      throw new Error('Unexpected undefined context time');
    }
    this.recorder.parameters
      .get('isRecording')
      .setValueAtTime(0, contextTime + 0.1);
  };

  render() {
    const { connected, analyzing, result, error } = this.state;
    return (
      <div class="live-detection-page">
        {error && <h1>{error}</h1>}
        <main class="live-detection__container">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <header>
              <h1 style={{ marginTop: 0 }}>Live Key Detection</h1>
            </header>
            <div>
              <div style={{ paddingBottom: '2rem' }}>
                <input
                  type="button"
                  onClick={this.routeSound}
                  value={
                    connected
                      ? 'Key detection engine running'
                      : 'Route sound to key detection engine'
                  }
                  disabled={connected}
                />
              </div>
              <div style={{ paddingBottom: '2rem' }}>
                <input
                  type="button"
                  onClick={this.startRecording}
                  value="Start Key Detection"
                  disabled={!connected || analyzing}
                  style={{ marginBottom: '0.5rem' }}
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
                  style={{ width: WIDTH, height: HEIGHT }}
                />
              </div>
              <div style={{ height: '2rem' }}>
                {result &&
                  `${analyzing ? 'Progressive' : 'Final'} Result: ${
                    keysNotation[result] || result
                  }`}
              </div>
            </div>
          </div>
          <div class="live-detection__circle-of-fifths">
            <CircleOfFifths result={result ?? undefined} />
          </div>
        </main>
      </div>
    );
  }
}

export default LiveDetection;
