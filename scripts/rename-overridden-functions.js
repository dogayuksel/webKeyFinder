var fs = require('fs')
fs.readFile('src/web/keyFinderProgressiveWorker.js', 'utf8', function (err, data) {
  if (err) {
    return console.log(err);
  }
  var result = data
      .replace(/_emscripten_worker_respond/, '_em_w_r_bak')
      .replace(/_emscripten_worker_respond_provisionally/, '_em_w_r_p_bak');

  fs.writeFile('src/web/keyFinderProgressiveWorker.js', result, 'utf8', function (err) {
     if (err) return console.log(err);
  });
});
