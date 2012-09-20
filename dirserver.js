#!/usr/bin/env node

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
