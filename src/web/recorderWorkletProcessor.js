class RecorderWorkletProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [{
      name: 'isRecording',
      defaultValue: 0
    }];
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
      audioBuffer: buffer
    });
    this._initBuffer();
  }

  _recordingStopped() {
    this.port.postMessage({
      eventType: 'stop'
    });
  }

  // inputs[n][m][i]
  // will access n-th input, m-th channel of that input, and i-th sample of that channel.
  process(inputs, _, parameters) {
    const isRecordingValues = parameters.isRecording;
    const numberOfChannels = inputs[0].length;
    for (let dataIndex = 0; dataIndex < isRecordingValues.length; dataIndex += 1) {
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
    return true;
  }
}

registerProcessor('recorder-worklet', RecorderWorkletProcessor);
