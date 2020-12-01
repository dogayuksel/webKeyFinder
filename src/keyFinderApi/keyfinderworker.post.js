var bufferAddress;

(function() {
  var messageBuffer = null, buffer = 0, bufferSize = 0;

  function flushMessages() {
    if (!messageBuffer) return;
    if (runtimeInitialized) {
      var temp = messageBuffer;
      messageBuffer = null;
      temp.forEach(function(message) {
        onmessage(message);
      });
    }
  }

  function messageResender() {
    flushMessages();
    if (messageBuffer) {
      setTimeout(messageResender, 100); // still more to do
    }
  }

  onmessage = function onmessage(msg) {
    // if main has not yet been called (mem init file, other async things), buffer messages
    if (!runtimeInitialized) {
      if (!messageBuffer) {
        messageBuffer = [];
        setTimeout(messageResender, 100);
      }
      messageBuffer.push(msg);
      return;
    }
    flushMessages();


    var func = Module['_' + msg.data['funcName']];
    if (!func) throw 'invalid worker function to call: ' + msg.data['funcName'];
    var data = msg.data['data'];
    if (msg.data['funcName'] === 'runFindKey') {
      var sampleRate = data[data.length - 1];
      var numberOfChannels = data[data.length - 2];
      const segmentSize = data[0].length * data[0].BYTES_PER_ELEMENT;
      const bufferSize = segmentSize * numberOfChannels;
      var buf = _malloc(bufferSize);
      bufferAddress = buf;
      for (let i = 0; i < numberOfChannels; i += 1) {
        HEAPF32.set(data[i], (buf + segmentSize * i) >> 2);
      }
      ccall(
        'runFindKey',
        'number',
        ['number', 'number', 'number', 'number'],
        [buf, bufferSize, numberOfChannels, sampleRate]
      );
      workerResponded = false;
      return;
    }

    if (data) {
      if (!data.byteLength) data = new Uint8Array(data);
      if (!buffer || bufferSize < data.length) {
        if (buffer) _free(buffer);
        bufferSize = data.length;
        buffer = _malloc(data.length);
      }
      HEAPU8.set(data, buffer);
    }

    workerResponded = false;
    workerCallbackId = msg.data['callbackId'];
    if (data) {
      func(buffer, data.length);
    } else {
      func(0, 0);
    }
  }
})();

function _emscripten_worker_respond(data, size) {
  if (workerResponded) throw 'already responded with final response!';
  workerResponded = true;
  var transferObject = {
    'callbackId': workerCallbackId,
    'finalResponse': true,
    'data': data ? new Uint8Array(HEAPU8.subarray((data),(data + size))) : 0
  };
  if (data) {
    Module._free(bufferAddress);
    postMessage(transferObject, [transferObject.data.buffer]);
  } else {
    postMessage(transferObject);
  }
}
