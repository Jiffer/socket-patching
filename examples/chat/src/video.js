'use strict'
var Socketiop2p = require('../../../index')
var io = require('socket.io-client')
var p2psocket;
/*
navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
*/
function init () {
  console.log("video.js init has been")
  var socket = io()
  var opts = {peerOpts: {trickle: false}, autoUpgrade: false}

  p2psocket = new Socketiop2p(socket, opts, function () {
    privateButton.disabled = false
    p2psocket.emit('peer-obj', 'Hello there. I am ' + p2psocket.peerId)
  })
  // Elements
  var privateButton = document.getElementById('private')
  
  

  // for webRTC connection requests
  p2psocket.on('go-private', function () { 
    goPrivate()
  })

  function goPrivate () {
    p2psocket.useSockets = false
    upgradeMsg.innerHTML = 'WebRTC connection established!'
    privateButton.disabled = true
    p2psocket.usePeerConnection = true;
  }

/*
  // video element
   var localVideo = document.querySelector('#localVideo');

  navigator.mediaDevices.getUserMedia({
    audio: false,
    video: true
  })
  .then(gotStream)
  .catch(function(e) {
    alert('getUserMedia() error: ' + e.name);
    }); 
  function gotStream(stream) {
  console.log('starting local video stream');
  localVideo.src = window.URL.createObjectURL(stream); // webrtc stuff
  localStream = stream;
  p2psocket.emit('gotVideo');
  if (isInitiator) {
    maybeStart();
  }
}*/

  } // end init

document.addEventListener('DOMContentLoaded', init, false)


