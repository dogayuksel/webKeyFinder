let keyFinderInstance;

(function () {
  var messageBuffer = null,
    buffer = 0,
    bufferSize = 0;

  function flushMessages() {
    if (!messageBuffer) return;
    if (runtimeInitialized) {
      var temp = messageBuffer;
      messageBuffer = null;
      temp.forEach(function (message) {
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

    var data = msg.data['data'];

    switch (msg.data['funcName']) {
      case 'initialize':
        const instance = new Module.KeyFinderInterface(data[0], data[1]);
        keyFinderInstance = instance;
        break;

      case 'feedAudioData':
        keyFinderInstance.feedAudioData(data[0]);
        break;

      case 'finalDetection':
        keyFinderInstance.finalDetection();
        break;
    }

    workerResponded = false;
    workerCallbackId = msg.data['callbackId'];
  };
})();

function _emscripten_worker_respond(data, size) {
  if (workerResponded) throw 'already responded with final response!';
  workerResponded = true;
  var transferObject = {
    callbackId: workerCallbackId,
    finalResponse: true,
    data: data ? new Uint8Array(HEAPU8.subarray(data, data + size)) : 0,
  };
  if (data) {
    keyFinderInstance.delete();
    keyFinderInstance = null;
    postMessage(transferObject, [transferObject.data.buffer]);
  } else {
    postMessage(transferObject);
  }
}

function _emscripten_worker_respond_provisionally(data, size) {
  if (workerResponded) throw 'already responded with final response!';
  var transferObject = {
    callbackId: workerCallbackId,
    finalResponse: false,
    data: data ? new Uint8Array(HEAPU8.subarray(data, data + size)) : 0,
  };
  if (data) {
    postMessage(transferObject, [transferObject.data.buffer]);
  } else {
    postMessage(transferObject);
  }
}
