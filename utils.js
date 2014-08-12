var fs = require('fs');

// utility functions
String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

exports.log = function(message, config) {
    console && console.log(message);
    if (config && config.persist_logs) {
        // hit that filesystem yo
        fs.appendFileSync(config.log_file, message + '\n');
    }
}