'use strict'
var Socketiop2p = require('../../../index')
var io = require('socket.io-client')

navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

function init () {
  
  // Elements
  var privateButton = document.getElementById('private')
  var socket = io()
  var opts = {peerOpts: {trickle: false}, autoUpgrade: false}

  var p2psocket = new Socketiop2p(socket, opts, function () {
    privateButton.disabled = false
    p2psocket.emit('peer-obj', 'Hello there. I am ' + p2psocket.peerId)
  })

  

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
  console.log('Adding local stream.');
  localVideo.src = window.URL.createObjectURL(stream);
  localStream = stream;
  sendMessage('got user media');
  if (isInitiator) {
    maybeStart();
  }
}

  } // end init

document.addEventListener('DOMContentLoaded', init, false)
