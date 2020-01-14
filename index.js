'use strict';

const SerialPort = require('serialport');
const NodeWebcam = require( "node-webcam" );
const Webcam = NodeWebcam.create();
const simplayer = require('simplayer');
const Twitter = require('twitter');
require('dotenv').config();
const fs = require('fs');

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
            postTweet();
            console.log('取ってやったぜ')
            isTaken = true;
        } );
    }, 4000)
}

function postTweet(){
    const client = new Twitter({
        consumer_key: process.env.TWITTER_CONSUMER_KEY,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
        access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
        access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
    });
    const imageData = fs.readFileSync("test_picture.jpg") //replace with the path to your image
    client.post("media/upload", {media: imageData}, function(error, media, response) {
        if (error) {
            console.log(error)
        } else {
            const status = {
                status: "sleeping-face-bot: 目覚ましが鳴っても起きなかった愚か者の寝顔はこちらです。",
                media_ids: media.media_id_string
            }
        
            client.post("statuses/update", status, function(error, tweet, response) {
                if (error) {
                    console.log(error)
                } else {
                    console.log("Successfully tweeted an image!")
                }
            })
        }
    })
}