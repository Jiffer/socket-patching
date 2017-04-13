var Socketiop2p = require('../../../index')
var io = require('socket.io-client')



function init () {
  var haveJoinedRoom = false
  var haveJoinedBoom = false

  // Elements
  var privateButton = document.getElementById('private')
  var form = document.getElementById('msg-form')
  var box = document.getElementById('msg-box')
  
  var msgList = document.getElementById('msg-list')
  var upgradeMsg = document.getElementById('upgrade-msg')
  var msgSubmitButton = document.getElementById('msg-submit')

  var roomForm = document.getElementById('room-form')
  var roomBox = document.getElementById('room-box')
  var roomSubmitButton = document.getElementById('room-button') 

  var boomForm = document.getElementById('boom-form')
  var boomBox = document.getElementById('boom-box')
  var boomSubmitButton = document.getElementById('boom-button') 

  var playClick = document.getElementById('emit-toggle')

  // web audio stuff
  // TODO - put this in its own file to be included...
  var AudioContext = window.AudioContext || window.webkitAudioContext;
  var audioCtx = new AudioContext();
  // this determines default tempo
  var quarterNote = .15;

  var toPlay = []; // holds incoming array to sequence

  // this is for the sound synthesis... 
  var sine = audioCtx.createOscillator();
  // sine.type = 'square';
  var biquadFilter = audioCtx.createBiquadFilter();
  var gain = audioCtx.createGain();

  // another sound
  var sine2 = audioCtx.createOscillator();
  var gain2 = audioCtx.createGain();
  var muteClick = audioCtx.createGain();

  // the patch
  sine.connect(biquadFilter);
  biquadFilter.connect(gain);
  gain.connect(audioCtx.destination);

  biquadFilter.type = "lowpass";
  biquadFilter.gain.value = 25;
  biquadFilter.Q.value = 10; // filter resonance

  gain.gain.value = 0;
  sine.start(0);

  // patch 2
  sine2.connect(gain2); // oscillator
  gain2.connect(muteClick); // used for turning notes on/off
  muteClick.connect(audioCtx.destination); // used to disable (mute) the click

  gain2.gain.value = 0;
  muteClick.gain.value = 0;
  sine2.start(0);
  // boom
  sine2.frequency.value = 110;

  var emitIntervalID; // to keep track of the interval function call
  
  // play a note....
  function playNote(noteToPlay){
    // TODO: check if there are any new notes to schedule
    var now = audioCtx.currentTime;
    if(noteToPlay != 32){
    sine.frequency.setValueAtTime(getFrequency(noteToPlay), now );
    gain.gain.setValueAtTime(.5, now ); // note on
    gain.gain.linearRampToValueAtTime(0, now + quarterNote); // note off
  }
  } 

  // end web audio stuff
  ////////////////////////////////////////////////

  //don't allow people to send stuff until they choose a room
  msgSubmitButton.disabled = true

  var socket = io() 
  var socket2 = io() // used for click track room
  var opts = {peerOpts: {trickle: false}, autoUpgrade: false}
  var p2psocket = new Socketiop2p(socket, opts, function () {
    privateButton.disabled = false
    p2psocket.emit('peer-obj', 'Hello there. I am ' + p2psocket.peerId)
  })

  var p2psocket2 = new Socketiop2p(socket2, opts, function () {
    privateButton.disabled = false
    p2psocket2.emit('peer-obj', 'Hello there. I am ' + p2psocket2.peerId)
  })

  roomForm.addEventListener('submit', function (e, d) {
    e.preventDefault()
    p2psocket.emit('join-room', roomBox.value)
    msgSubmitButton.disabled = false
    roomBox.disabled = true
    roomSubmitButton.disabled = true
    haveJoinedRoom = true
  })

  boomForm.addEventListener('submit', function (e, d) {
    e.preventDefault()
    p2psocket2.emit('join-room', boomBox.value)
    // msgSubmitButton.disabled = false
    boomBox.disabled = true
    boomSubmitButton.disabled = true
    haveJoinedBoom = true
  })

  p2psocket.on('peer-msg', function (data) {
    if (haveJoinedRoom){
      var li = document.createElement('li')
      li.appendChild(document.createTextNode(data.textVal))
      msgList.appendChild(li)

      console.log("got peer-message: " + data.textVal);
    }

    if (typeof data.textVal === 'string') {
      //console.log("got this many: " + data.textVal.length);

      for(var i = 0; i < data.textVal.length; i++){
        // store the incoming string as an array of chars
        toPlay.push(data.textVal.charCodeAt(i));
      }

  }

  })


  form.addEventListener('submit', function (e, d) {
    e.preventDefault()
    var li = document.createElement('li')
    li.appendChild(document.createTextNode(box.value))
    msgList.appendChild(li)
    
    p2psocket.emit('peer-msg', {textVal: box.value})
    // clear message
    box.value = ''
    
  })


  privateButton.addEventListener('click', function (e) {
    goPrivate()
    p2psocket.emit('go-private', true)
  })

  p2psocket.on('go-private', function () {
    goPrivate()
  })

  function goPrivate () {
    p2psocket.useSockets = false
    upgradeMsg.innerHTML = 'WebRTC connection established!'
    privateButton.disabled = true
    p2psocket.usePeerConnection = true;
  }

  /// boom handler
  p2psocket2.on('boom', function(){
    var now = audioCtx.currentTime;
    
    gain2.gain.linearRampToValueAtTime(.5, now + .05 ); // note on
    gain2.gain.linearRampToValueAtTime(0, now + quarterNote); // note off

    if(toPlay.length > 0){
        // play a note and then shift it out of the list
        playNote(toPlay[0]);
        toPlay.shift();
      }

  })

  // Check toggle box to send pulse out or not
  playClick.addEventListener('click', function(){

    if(playClick.checked == true){
      console.log("unmute click");
      muteClick.gain.value = 1.0;
      
    }
    else{
      muteClick.gain.value = 0;
    }

  })
}

document.addEventListener('DOMContentLoaded', init, false)
