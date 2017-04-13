// https://sigusrone.com/articles/building-a-synth-with-the-web-audio-api-part-two 

function getFrequency(midi_code) {
  var offset_code = midi_code - 69;
  if (offset_code > 0) {
    return Number(440 * Math.pow(2, offset_code / 12));
  } else {
    return Number(440 / Math.pow(2, -offset_code / 12));
  }
}