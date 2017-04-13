var Socketiop2p = require('../../../index')
var io = require('socket.io-client')

function init () {
  var haveJoinedBoom = false

  // Elements
  var privateButton = document.getElementById('private')
  
  var boomForm = document.getElementById('boom-form')
  var boomBox = document.getElementById('boom-box')
  var boomSubmitButton = document.getElementById('boom-button') 

  var emitToggle = document.getElementById('emit-toggle')
  var emitIntervalID; // to keep track of the interval function call so I can kill it (softly)
  
  var socket2 = io()
  var opts = {peerOpts: {trickle: false}, autoUpgrade: false}

  var p2psocket2 = new Socketiop2p(socket2, opts, function () {
    privateButton.disabled = false
    p2psocket2.emit('peer-obj', 'Hello there. I am ' + p2psocket2.peerId)
  })

  // name the boom room
  boomForm.addEventListener('submit', function (e, d) {
    e.preventDefault()
    p2psocket2.emit('join-room', boomBox.value)
    // msgSubmitButton.disabled = false
    boomBox.disabled = true
    boomSubmitButton.disabled = true
    haveJoinedBoom = true
  })

  // for webRTC connection requests
  p2psocket2.on('go-private', function () { 
    goPrivate()
  })

  function goPrivate () {
    p2psocket.useSockets = false
    upgradeMsg.innerHTML = 'WebRTC connection established!'
    privateButton.disabled = true
    p2psocket.usePeerConnection = true;
  }


  // Check toggle box to send pulse out or not
  emitToggle.addEventListener('click', function(){

    if(emitToggle.checked == true){
      console.log("turning on click");
      emitIntervalID = setInterval(function(){  
        p2psocket2.emit('boom');
        // generate a pulse....
        }, 200); // ms
    }
    else{
      clearInterval(emitIntervalID);
    }

  })
}

document.addEventListener('DOMContentLoaded', init, false)
