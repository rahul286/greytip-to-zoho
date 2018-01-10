var greytipToZoho = require('./index.js');

// capture command-line arguments
const args = process.argv

// pass input GreytipHR excel file path
greytipToZoho(args[2])
