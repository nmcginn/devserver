// global variables & configuration
var fs = require('fs');
var utils = require('./utils.js');
var configFile = 'config.json';
var initialConfig = JSON.parse(fs.readFileSync(configFile));
var server = {};

// watch file system for changes to configuration
fs.watchFile(configFile, function(curr, prev) {
    utils.log('config change detected', config);
    // reload the configuration
    var config = JSON.parse(fs.readFileSync(configFile));
    if (typeof server !== 'undefined') {
        server.close();
    }
    serveStatic(config);
});

// start the server
serveStatic(initialConfig);

// server functions
function serveStatic(config) {
    var http = require('http');
    var startTime;
    server = http.createServer(function(req, res) {
        try {
            res.setHeader('Connection', "close");
            // initial configuration
            if (config.profile) {
                startTime = process.hrtime();
            }
            var file = config.serve_root + req.url;
            // check for a default document, if dir_browsing is off
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
                res.statusCode = 200;
                res.write(fs.readFileSync(file));
                res.end();
            } else if (file.endsWith('/') && config.directory_browsing) {
                res.statusCode = 200;
                try {
                    var ls = fs.readdirSync(file);
                    var dirlist = fs.readFileSync('./.templates/dirlist.html');
                    dirlist = dirlist.toString().replace('__JSON__', JSON.stringify(ls));
                    res.write(dirlist);
                    res.end();
                } catch (err) {
                    res.statusCode = 404;
                    throw err;
                }
            } else {
                // respond negatively
                res.statusCode = 404;
                throw new Error(file + ' Not Found');
            }
        } catch (err) {
            if (res.statusCode === 200)
                res.statusCode = 500;
            var noCustom = false;
            if (config.custom_errors) {
                if (fs.existsSync('./.templates/' + res.statusCode + '.html')) {
                    var errorHtml = fs.readFileSync('./.templates/' + res.statusCode + '.html');
                    errorHtml = errorHtml.toString().replace('__JSON__', '{"error":"' + err + '"}');
                    res.write(errorHtml);
                } else {
                    noCustom = true;
                }
            }
            if (config.custom_errors && noCustom) {
                res.write(http.STATUS_CODES[res.statusCode]);
                if (config.detailed_errors)
                    res.write('\n' + err);
            }
            res.end();
        }
        // final request tasks (response already sent)
        if (config.profile) {
            var endTime = process.hrtime();
            var seconds = endTime[0] - startTime[0];
            var nanoseconds = endTime[1] - startTime[1];
            var ms = (seconds * 1000) + (nanoseconds / 1000000);
            utils.log(Math.floor(ms) + 'ms - ' + res.statusCode + ' ' + req.method + ' ' + req.url, config);
        } else {
            utils.log(res.statusCode + ' ' + req.method + ' ' + req.url, config);            
        }
    });
    utils.log('Starting server on port ' + config.port, config);
    server.listen(config.port);
}