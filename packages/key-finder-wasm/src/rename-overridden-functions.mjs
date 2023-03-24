import * as fs from 'fs';

fs.readFile('dist/keyFinderProgressiveWorker.js', 'utf8', function (err, data) {
  if (err) {
    return console.log(err);
  }
  var result = data
    .replace(/_emscripten_worker_respond/, '_em_w_r_bak')
    .replace(/_emscripten_worker_respond_provisionally/, '_em_w_r_p_bak');

  fs.writeFile(
    'dist/keyFinderProgressiveWorker.js',
    result,
    'utf8',
    function (err) {
      if (err) return console.log(err);
    }
  );
});
