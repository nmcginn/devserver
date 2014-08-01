// global variables & configuration
var fs = require('fs');
var utils = require('./utils.js');
var configFile = 'config.json';
var config = JSON.parse(fs.readFileSync(configFile));
var server = {};

// watch file system for changes to configuration
fs.watchFile(configFile, function(curr, prev) {
    console.log('config change detected');
    // reload the configuration
    config = JSON.parse(fs.readFileSync(configFile));
    if (typeof server !== 'undefined') {
        server.close();
    }
    serveStatic(config);
});

// start the server
serveStatic(config);

// server functions
function serveStatic(config) {
    var http = require('http');
    var startTime;
    server = http.createServer(function(req, res) {
        try {
            // initial configuration
            if (config.profile) {
                startTime = process.hrtime();
            }
            var file = config.serve_root + req.url;
            // check for a default document
            if (req.url === '/') {
                for (var i = 0; i < config.default_doc.length; i++) {
                    if (fs.existsSync(file + config.default_doc[i])) {
                        file += config.default_doc[i];
                        break;
                    }
                }
            }
            
            // see if the file requested exists
            if (!file.endsWith('/') && fs.existsSync(file)) {
                // respond affirmatively
                res.write(fs.readFileSync(file));
                res.end();
            } else {
                // respond negatively
                res.statusCode = 404;
                res.end(http.STATUS_CODES[res.statusCode]);
            }
        } catch (err) {
            res.statusCode = 500;
            res.end(http.STATUS_CODES[res.statusCode] + '\n' + err);
        }
        // final request tasks (response already sent)
        if (config.profile) {
            var endTime = process.hrtime();
            var seconds = endTime[0] - startTime[0];
            var nanoseconds = endTime[1] - startTime[1];
            var ms = (seconds * 1000) + (nanoseconds / 1000000);
            console.log(Math.floor(ms) + 'ms - ' + res.statusCode + ' ' + req.method + ' ' + req.url);
        } else {
            console.log(res.statusCode + ' ' + req.method + ' ' + req.url);            
        }
    });
    console.log('Starting server on port ' + config.port);
    server.listen(config.port);
}