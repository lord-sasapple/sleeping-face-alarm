'use strict';

const SerialPort = require('serialport');
const NodeWebcam = require( "node-webcam" );
const Webcam = NodeWebcam.create();


const port = new SerialPort("/dev/cu.usbmodem14101", {
    parser: SerialPort.parsers.readline('\n'),
    baudrate: 9600
});

port.on('open', function () {
    console.log('Serial open.');
    setInterval(write, 1000, 'OK\n');
});

port.on('data', function (data) {
    console.log('Data: ' + data);
});

function write(data) {
    // console.log('Write: ' + data);
    port.write(new Buffer(data), function(err, results) {
        if(err) {
            console.log('Err: ' + err);
            console.log('Results: ' + results);
        }
    });
}

