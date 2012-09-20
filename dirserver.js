//   Copyright 2012 Patrick Wang (kk1fff)
//
//   Licensed under the Apache License, Version 2.0 (the "License");
//   you may not use this file except in compliance with the License.
//   You may obtain a copy of the License at
//
//       http://www.apache.org/licenses/LICENSE-2.0
//
//   Unless required by applicable law or agreed to in writing, software
//   distributed under the License is distributed on an "AS IS" BASIS,
//   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//   See the License for the specific language governing permissions and
//   limitations under the License.

var lib = require('./lib.js');

// Process info
var baseDir = process.cwd();
var setting = null;
var server = null;

// Start server ----------------------------------------------------------------

var startServer = function() {
  server = http.createServer(lib.generatePathHandler(baseDir, setting));
  server.listen(serverPort);
  console.log("Serving file based on: " + baseDir);
};

// Load user defined configuration ---------------------------------------------

fs.readFile(baseDir + "/setting.json", function(err, d) {
  if (err === null || err === undefined) {
    // User has his own setting.
    setting = JSON.parse(d);
    startServer();
  } else {
    startServer();
  }
});
