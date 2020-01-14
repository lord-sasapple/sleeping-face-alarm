'use strict';

const SerialPort = require('serialport');
const NodeWebcam = require( "node-webcam" );
const Webcam = NodeWebcam.create();
const simplayer = require('simplayer');


const port = new SerialPort("/dev/cu.usbmodem14101", {
    parser: SerialPort.parsers.readline('\n'),
    baudrate: 9600
});

port.on('open', function () {
    console.log('15秒タイマースタート！')
    setTimeout(function(){
        let count = 0;
        const play = () => simplayer('alarm.mp3', function (error) {
            count++
            if (count<3 && !isWokeUp){
                play()
            } else if(!isWokeUp) {
                console.log('こいつ起きない')
                takePhoto();
            } else {
                console.log('よく起きたな')
            }
        });
        play()
    }, 15000)
});

let isTenSecPassed = true;
let isTaken = false;
let isWokeUp = false;
let wakeUpCount = 0

port.on('data', function (data) {
    // console.log('Data: ' + data);

    // もし起き上がっていたらカウントをふやす
    if (1000 < Number(data)){
        wakeUpCount++
        console.log('起きたポイント', wakeUpCount)
    }

    // wakeUpCountが10までいったら起きたとみなす
    if (10 < wakeUpCount){
        isWokeUp = true;
    }

    // もしアラームがなってから20秒経って、且つ、
    // 圧力センサの値が1000未満
    // = 圧力がかかっている
    // = 寝ている
    // 且つ、まだ写真を取っていなかったら
    // 写真を撮る
    // if (isTenySecPassed && 1000 > Number(data) && !isTaken){
    //     isTaken = true;
    //     takePhoto();
    // }
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

function takePhoto(){
    // 撮るよ〜と言う
    simplayer('pasha.mp3');

    // 4秒待って写真とる
    setTimeout(function(){
        Webcam.capture( "test_picture", function( err, data ) {
            console.log('取ってやったぜ')
            isTaken = true;
        } );
    }, 4000)
}