import { Component } from 'preact';
import { keyFinderUtils, audioUtils } from '../Utils';
import { keysNotation } from '../defaults';
import CircleOfFifths from '../CircleOfFifths';

import './AudioFileItem.css';

export interface FileItem {
  id: string;
  canProcess: boolean;
  file: File;
  result: string | null;
  digest: string | null;
}

interface Props {
  fileItem: FileItem;
  updateDigest: (uuid: string, digest: string) => void;
  updateResult: (uuid: string, result: string) => void;
}

interface State {
  analysisStart: number | null;
  analysisDuration: number | null;
  currentSegment: number | null;
  maxSegments: number | null;
  analyzing: boolean;
  result: string | null;
}

class AudioFileKeyDetection extends Component<Props, State> {
  worker: Worker | null = null;
  terminated: boolean = false;

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

  componentDidUpdate(prevProps: Props) {
    if (
      prevProps.fileItem.canProcess === false &&
      this.props.fileItem.canProcess === true
    ) {
      const reader = new FileReader();
      reader.onload = this.handleFileLoad;
      reader.readAsArrayBuffer(this.props.fileItem.file);
    }
  }

  componentWillUnmount() {
    this.terminated = true;
    this.worker?.terminate();
  }

  advanceSegmentCount = () => {
    this.setState(({ currentSegment }) => ({
      currentSegment: (currentSegment ?? 0) + 1,
    }));
  };

  postAudioSegmentAtOffset = (
    worker: Worker,
    channelData: Float32Array[],
    sampleRate: number,
    numberOfChannels: number,
    offset: number
  ) => {
    const segment = keyFinderUtils.zipChannelsAtOffset(
      channelData,
      offset,
      sampleRate,
      numberOfChannels
    );
    worker.postMessage({ funcName: 'feedAudioData', data: [segment] });
  };

  handleAudioFile = (buffer: AudioBuffer) => {
    if (this.terminated) return;
    const sampleRate = buffer.sampleRate;
    const numberOfChannels = buffer.numberOfChannels;
    const channelData: Float32Array[] = [];
    for (let i = 0; i < numberOfChannels; i += 1) {
      channelData.push(buffer.getChannelData(i));
    }

    this.setState({
      analyzing: true,
      analysisStart: performance.now(),
      analysisDuration: null,
    });
    this.worker = keyFinderUtils.initializeKeyFinder({
      sampleRate,
      numberOfChannels,
    });
    const segmentCounts = Math.floor(channelData[0].length / sampleRate);
    this.setState({ maxSegments: segmentCounts, currentSegment: 0 });

    this.worker.addEventListener('message', (event) => {
      if (event.data.finalResponse) {
        const result = keyFinderUtils.extractResultFromByteArray(
          event.data.data
        );
        this.setState((oldState) => ({
          result,
          analysisDuration: performance.now() - (oldState.analysisStart ?? 0),
          analyzing: false,
        }));
        this.props.updateResult(this.props.fileItem.id, result);
        this.worker?.terminate();
        this.worker = null;
      } else {
        // Not final response
        if (event.data.data === 0) {
          // very first response
          if (!this.worker) {
            throw new Error('Unexpected missing key analysis worker');
          }
          this.postAudioSegmentAtOffset(
            this.worker,
            channelData,
            sampleRate,
            numberOfChannels,
            0
          );
          this.advanceSegmentCount();
        } else {
          // not first response
          if (!this.worker) {
            throw new Error('Unexpected missing key analysis worker');
          }
          if (!this.state.currentSegment) {
            throw new Error('Unexpected undefined current segment');
          }
          const result = keyFinderUtils.extractResultFromByteArray(
            event.data.data
          );
          this.setState({ result });

          if (this.state.currentSegment < segmentCounts) {
            const offset = this.state.currentSegment * sampleRate;
            this.postAudioSegmentAtOffset(
              this.worker,
              channelData,
              sampleRate,
              numberOfChannels,
              offset
            );
            this.advanceSegmentCount();
          } else {
            // no more segments
            this.worker.postMessage({ funcName: 'finalDetection' });
          }
        }
      }
    });
  };

  handleFileLoad = async (event: ProgressEvent<FileReader>): Promise<void> => {
    if (!(event.target?.result instanceof ArrayBuffer)) {
      throw new Error('Unexpected result when reading given file');
    }
    const context = audioUtils.createAudioContext();
    const digest = await crypto.subtle.digest('SHA-256', event.target.result);
    const hashArray = Array.from(new Uint8Array(digest));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    this.props.updateDigest(this.props.fileItem.id, hashHex);
    context.decodeAudioData(event.target.result, this.handleAudioFile);
  };

  render() {
    const { fileItem } = this.props;
    const { currentSegment, maxSegments, result, analysisDuration } =
      this.state;

    return (
      <div class="file-item__container">
        <div class="file-item__song-name">{fileItem.file.name}</div>
        <div class="file-item__result-container">
          <div class="file-item__result-text">
            {result && keysNotation[result] && `${keysNotation[result]}`}
          </div>
          <div class="file-item__circle">
            <CircleOfFifths mini={true} result={result ?? undefined} />
          </div>
        </div>
        <div class="file-item__progress-indicator">
          <progress
            value={currentSegment ?? 0}
            max={maxSegments ?? undefined}
          ></progress>
          {result &&
            analysisDuration &&
            `${(analysisDuration / 1000).toFixed(1)} s`}
        </div>
      </div>
    );
  }
}

export default AudioFileKeyDetection;
