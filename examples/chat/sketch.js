// P5 STUFF

var newX, newY, pX, pY;
var weight;


function setup() {
	createCanvas(320, 240);
	capture = createCapture(VIDEO);
  capture.size(320, 240);
  capture.hide();

  newX = 0;
  newY = 0;
  pX = 0;
  pY = 0;
  weight = .85;
}

function draw() {
	
	// load pixels
  capture.loadPixels();

	background(200);
  image(capture, 0, 0, 320, 240); // 

  var stepSize = 10;
  var brightestX = 0;
  var brightestY = 0;
  var brightVal = -1
  var index = -1;
  for (var y=0; y<height; y+=stepSize) {
    for (var x=0; x<width; x+=stepSize) {
      var i = 4 * (y * width + x);
      
      var pixelValue = capture.pixels[i];
      pixelValue += capture.pixels[i+1];
      pixelValue += capture.pixels[i+2];
      pixelValue += capture.pixels[i+3];
      if( pixelValue > brightVal)
      {
        brightVal = pixelValue;
        index = i;
        brightestX = x;
        brightestY = y;
      }
    }     
  }

  newX = (1 - weight) * brightestX + weight * pX;
  newY = (1 - weight) * brightestY + weight * pY;
  
  // save previous x, y position for next time around 
  pX = newX;
  pY = newY;

  ellipse(newX, newY, 20, 20);

  sendLoc({
    'x': newX,
    'y': newY
  });
}
  


//SEND MY DRAWING DATA 
//'message' is a JSON object that includes x, y, r, g, b
function sendLoc(message){
	p2psocket.emit('loc', message);  // socket.emit('drawing', message);
 	// console.log(message);
}

