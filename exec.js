var greytipToZoho = require('./index.js');

// capture command-line arguments
const args = process.argv

// pass input GreytipHR excel file path and optional outfile path
if (typeof args[2] != 'undefined') {
    if (typeof args[3] != 'undefined') {
        greytipToZoho(args[2], args[3])
    } else {
        greytipToZoho(args[2])
    }
}
