class RecorderWorkletProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      {
        name: 'isRecording',
        defaultValue: 0,
      },
    ];
  }

  constructor() {
    super();
    this._bufferSize = 50000;
    this._buffer = new Float32Array(this._bufferSize);
    this._initBuffer();
  }

  _initBuffer() {
    this._bytesWritten = 0;
  }

  _isBufferEmpty() {
    return this._bytesWritten === 0;
  }

  _isBufferFull() {
    return this._bytesWritten === this._bufferSize;
  }

  _appendToBuffer(value) {
    if (this._isBufferFull()) {
      this._flush();
    }
    this._buffer[this._bytesWritten] = value;
    this._bytesWritten += 1;
  }

  _flush() {
    let buffer = this._buffer;
    if (this._bytesWritten < this._bufferSize) {
      buffer = buffer.slice(0, this._bytesWritten);
    }
    this.port.postMessage({
      eventType: 'data',
      audioBuffer: buffer,
    });
    this._initBuffer();
  }

  _recordingStopped() {
    this.port.postMessage({
      eventType: 'stop',
    });
  }

  // inputs[n][m][i]
  // will access n-th input,
  // m-th channel of that input,
  // and i-th sample of that channel.
  process(inputs, _, parameters) {
    const numberOfChannels = inputs[0].length;
    const isRecordingValues = parameters.isRecording;

    if (isRecordingValues.length === 1) {
      // If there's no automation happening during the time
      // represented by the current block, the array [of parameter values]
      // may contain a single value that is constant for the entire block,
      // https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletProcessor/process#parameters
      const shouldRecord = isRecordingValues[0] > 0.9;
      if (!shouldRecord && !this._isBufferEmpty()) {
        this._flush();
        this._recordingStopped();
      }
      if (shouldRecord) {
        const numberOfSamples = inputs[0][0].length;
        for (let dataIndex = 0; dataIndex < numberOfSamples; dataIndex += 1) {
          let mono = 0.0;
          for (let channel = 0; channel < numberOfChannels; channel += 1) {
            mono += inputs[0][channel][dataIndex];
          }
          this._appendToBuffer(mono / numberOfChannels);
        }
      }
    } else {
      // parameter values array length should match number of samples
      for (
        let dataIndex = 0;
        dataIndex < isRecordingValues.length;
        dataIndex += 1
      ) {
        const shouldRecord = isRecordingValues[dataIndex] > 0.9;

        if (!shouldRecord && !this._isBufferEmpty()) {
          this._flush();
          this._recordingStopped();
        }
        if (shouldRecord) {
          let mono = 0.0;
          for (let channel = 0; channel < numberOfChannels; channel += 1) {
            mono += inputs[0][channel][dataIndex];
          }
          this._appendToBuffer(mono / numberOfChannels);
        }
      }
    }
    return true;
  }
}

registerProcessor('recorder-worklet', RecorderWorkletProcessor);
