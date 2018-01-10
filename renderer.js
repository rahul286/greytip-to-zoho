// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
var greytipToZoho = require('./index.js');
//@src https://nodejs.org/api/path.html
const path = require('path')
const os = require('os')
const shell = require('electron').shell
const ipc = require('electron').ipcRenderer

const selectDirBtn = document.getElementById('select-file')

selectDirBtn.addEventListener('click', function (event) {
    ipc.send('open-file-dialog')
})

ipc.on('selected-file', function (event, infile) {
    document.getElementById('selected-file').innerHTML = `You selected: ${infile}`
    var outfile = greytipToZoho(infile[0])

    console.log(path.dirname(infile[0]))
    // shell.showItemInFolder(path.dirname(infile[0]))
    shell.showItemInFolder(outfile)

    new window.Notification('Success', {
        body: infile[0] + ' file converted successfully! 🎉'
    })
})
