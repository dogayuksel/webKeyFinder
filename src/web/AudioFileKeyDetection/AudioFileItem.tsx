import { h, Fragment, Component } from 'preact';
import { keyFinderUtils } from '../Utils';
import { keysNotation } from '../defaults';

import './AudioFileItem.css';

export interface FileItem {
  id: string,
  canProcess: boolean,
  file: File,
  result: string | null,
  digest: string | null,
}

interface Props {
  fileItem: FileItem,
  updateDigest: (uuid: string, digest: string) => void,
  updateResult: (uuid: string, result: string) => void,
}

interface State {
  analysisStart: number,
  analysisDuration: number,
  currentSegment: number,
  maxSegments: number,
  analyzing: boolean,
  result: string,
};

class AudioFileKeyDetection extends Component<Props, State> {
  state: State = {
    analysisStart: null,
    analysisDuration: null,
    currentSegment: null,
    maxSegments: null,
    analyzing: false,
    result: null,
  };

  componentDidMount() {
    if (this.props.fileItem.canProcess) {
      const reader = new FileReader();
      reader.onload = this.handleFileLoad;
      reader.readAsArrayBuffer(this.props.fileItem.file);
    }
  }
  
  componentDidUpdate(prevProps) {
    if (prevProps.fileItem.canProcess === false &&
        this.props.fileItem.canProcess === true) {
      const reader = new FileReader();
      reader.onload = this.handleFileLoad;
      reader.readAsArrayBuffer(this.props.fileItem.file);
    }
  }

  advanceSegmentCount = () => {
    this.setState(({ currentSegment }) => ({ currentSegment: currentSegment + 1 }));
  }

  postAudioSegmentAtOffset = (worker, channelData, sampleRate, numberOfChannels, offset) => {
    const segment = keyFinderUtils.zipChannelsAtOffset(
      channelData, offset, sampleRate, numberOfChannels
    );
    worker.postMessage({ funcName: 'feedAudioData', data: [segment] });
  }

  handleAudioFile = (buffer: AudioBuffer) => {
    const sampleRate = buffer.sampleRate;
    const numberOfChannels = buffer.numberOfChannels;
    const channelData = [];
    for (let i = 0; i < numberOfChannels; i += 1) {
      channelData.push(buffer.getChannelData(i));
    }

    this.setState({
      analyzing: true,
      analysisStart: performance.now(),
      analysisDuration: null
    });
    const worker = keyFinderUtils.initializeKeyFinder({
      sampleRate,
      numberOfChannels
    });
    const segmentCounts = Math.floor(channelData[0].length / sampleRate);
    this.setState({ maxSegments: segmentCounts, currentSegment: 0 });

    worker.addEventListener('message', (event) => {
      if (event.data.finalResponse) {
        const result = keyFinderUtils.extractResultFromByteArray(event.data.data)
        this.setState((oldState) => ({
          result,
          analysisDuration: performance.now() - oldState.analysisStart,
          analyzing: false
        }));
        this.props.updateResult(this.props.fileItem.id, result);

      } else { // Not final response
        if (event.data.data === 0) { // very first response
          this.postAudioSegmentAtOffset(
            worker, channelData, sampleRate, numberOfChannels, 0
          );
          this.advanceSegmentCount();

        } else { // not first response
          const result = keyFinderUtils.extractResultFromByteArray(event.data.data);
          this.setState({ result });

          if (this.state.currentSegment < segmentCounts) {
            const offset = this.state.currentSegment * sampleRate;
            this.postAudioSegmentAtOffset(
              worker, channelData, sampleRate, numberOfChannels, offset
            );
            this.advanceSegmentCount();

          } else { // no more segments
            worker.postMessage({ funcName: 'finalDetection' });
          }
        }
      }
    });
  }

  handleFileLoad = async (event: ProgressEvent<FileReader>): Promise<void> => {
    var context = new AudioContext();
    const digest = await crypto.subtle.digest('SHA-256', event.target.result as ArrayBuffer);
    const hashArray = Array.from(new Uint8Array(digest));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    this.props.updateDigest(this.props.fileItem.id, hashHex);
    context.decodeAudioData(event.target.result as ArrayBuffer, this.handleAudioFile)
  }

  render ({ fileItem }, { currentSegment, maxSegments, analyzing, result, analysisDuration }) {
    return (
      <div style={{ paddingTop: '1rem', height: '2rem', maxWidth: '36rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {fileItem.file.name}
          <div style={{ paddingLeft: '1rem', display: 'flex', alignItems: 'center' }}>
            <div style={{ paddingRight: '0.3rem' }}>
              {result && keysNotation[result] && `${keysNotation[result]}`}
            </div>
            <progress value={currentSegment} max={maxSegments}></progress>
            <div style={{ fontSize: '0.85rem', width: '3rem', paddingLeft: '0.3rem' }}>
              {result && analysisDuration &&
                `${(analysisDuration/1000).toFixed(1)} s`
              }
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default AudioFileKeyDetection;
