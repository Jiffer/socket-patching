var Socketiop2p = require('../../../index')
var io = require('socket.io-client')



function init () {
  var haveJoinedRoom = false
  var haveJoinedBoom = false

  // Elements
  var privateButton = document.getElementById('private')
  var form = document.getElementById('msg-form')
  var box = document.getElementById('msg-box')
  var boxFile = document.getElementById('msg-file')
  var msgList = document.getElementById('msg-list')
  var upgradeMsg = document.getElementById('upgrade-msg')
  var msgSubmitButton = document.getElementById('msg-submit')

  var roomForm = document.getElementById('room-form')
  var roomBox = document.getElementById('room-box')
  var roomSubmitButton = document.getElementById('room-button') 

  var boomForm = document.getElementById('boom-form')
  var boomBox = document.getElementById('boom-box')
  var boomSubmitButton = document.getElementById('boom-button') 

  var emitToggle = document.getElementById('emit-toggle')

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
  sine2.connect(gain2);
  gain2.connect(audioCtx.destination);

  gain2.gain.value = 0;
  sine2.start(0);
  // boom
  sine2.frequency.value = 80;

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

  // https://sigusrone.com/articles/building-a-synth-with-the-web-audio-api-part-two 
function getFrequency(midi_code) {
  var offset_code = midi_code - 69;
  if (offset_code > 0) {
    return Number(440 * Math.pow(2, offset_code / 12));
  } else {
    return Number(440 / Math.pow(2, -offset_code / 12));
  }
}
  // end web audio stuff
  ////////////////////////////////////////////////

  //don't allow people to send stuff until they choose a room
  msgSubmitButton.disabled = true

  var socket = io()
  var socket2 = io()
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
    if (boxFile.value !== '') {
      var reader = new window.FileReader()
      reader.onload = function (evnt) {
        p2psocket.emit('peer-file', {file: evnt.target.result})
      }
      reader.onerror = function (err) {
        console.error('Error while reading file', err)
      }
      reader.readAsArrayBuffer(boxFile.files[0])
    } else {
      p2psocket.emit('peer-msg', {textVal: box.value})
    }
    box.value = ''
    boxFile.value = ''
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
