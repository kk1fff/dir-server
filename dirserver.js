#!/usr/bin/env node

// Node.js libraries.
var http = require("http");
var url  = require("url");
var path = require("path");
var fs   = require("fs");

// Depended libraries.
var mime = require("mime");

// Process info
var baseDir = process.cwd();

// Configurations
var logFormat    = ["client_ip", "req_method", "req_path", "req_host",
                   "resp_code", "actual_path", "error"];
var serverPort   = 8080;
var defaultFile  = ["index.html", "index.htm"];
var cacheAllowed = false;
var cacheSecond  = 3600;

// -----------------------------------------------------------------------------

var logOutputFunc = console.log;

var logger = function(log) {
  if (log instanceof Object) {
    var out = "";
    for (var i = 0; i < logFormat.length; i++) {
      if (log.hasOwnProperty(logFormat[i])) {
        out += (log[logFormat[i]] + " ");
      }
    }
    logOutputFunc(out);
  } else {
    logOutputFunc(log);
  }
};

var sendError404 = function(resp, log, error) {
  resp.statusCode = 404;
  resp.end();

  error = error || "Error: 404";

  log['resp_code'] = 404;
  log['error'] = error;
  logger(log);
};

var tryDefaultFile = function(p, serveFileFunc, req, resp, log, count) {
  count = count || 0;

  if (count < defaultFile.length) {
    fs.stat(p + "/" + defaultFile[count], function(err, stats) {
      if (stats === undefined || stats === null || !stats.isFile()) {
        // Still not found.
        tryDefaultFile(p, serveFileFunc, req, resp, log, count + 1);
      } else {
        // Found.
        serveFileFunc(p + "/" + defaultFile[count], req, resp, log);
      }
    });
  } else {
    // Finally, not found.
    sendError404(resp, log, "Found directionary, but not any default file");
  }
};

var buildFileResponseHeader = function(filePath, resp) {
  resp.setHeader('Content-Type', mime.lookup(filePath));

  if (cacheAllowed) {
    resp.setHeader('Cache-Control', 'max-age=' + cacheSecond);
  } else {
    resp.setHeader('Cache-Control', 'no-cache');    
  }
}

var serveFile = function(filePath, req, resp, log) {
  var fileStream = fs.createReadStream(filePath, {
    "flags" : "r",
  });

  buildFileResponseHeader(filePath, resp);
  resp.statusCode = log['resp_code'] = 200;
  fileStream.on("data", function(d) {
    resp.write(d);
  });
  fileStream.on("end", function() {
    resp.end();
  });
  logger(log);
};

var server = http.createServer(function(req, resp) {
  var u = url.parse(req.url);
  var filePath = path.resolve(baseDir, u.pathname.slice(1));

  var log = {
    "req_path"    : u.pathname,
    "actual_path" : filePath
  };

  // Restrict in working directory.
  var relative = path.relative(baseDir, filePath);
  if (relative.length >= 2 && relative.slice(0, 2) == "..") {
    sendError404(resp, log, "Illegal path");
    return;
  }

  // Check target file. Exist, is a directory or not exist.
  fs.stat(filePath, function (err, stats) {
    if (stats === null || stats === undefined) {
      sendError404(resp, log, "Path not found");
    } else {
      if (stats.isFile()) {
        // Serve file
        serveFile(filePath, req, resp, log);
      } else if (stats.isDirectory()) {
        // Try default file
        tryDefaultFile(filePath, serveFile, req, resp, log);
      }
    }
  });
});


// Start server ----------------------------------------------------------------

var startServer = function() {
  server.listen(serverPort);
  console.log("Serving file based on: " + baseDir);
};

// Load user defined configuration ---------------------------------------------

fs.readFile(baseDir + "/setting.json", function(err, d) {
  if (err === null || err === undefined) {
    // User has his own setting.
    var setting = JSON.parse(d);

    if (setting.hasOwnProperty("port")) {
      serverPort = setting['port'];
    }

    if (setting.hasOwnProperty("cache_allowed")) {
      cacheAllowed = !!setting['cache_allowed'];
    }

    if (setting.hasOwnProperty("cache_second")
        && typeof setting['cache_second'] == 'number') {
      cacheSecond = setting['cache_second'];
    }

    if (setting.hasOwnProperty("mime")) {
      mime.define(setting['mime']);
    }

    startServer();
  } else {
    startServer();
  }
});
