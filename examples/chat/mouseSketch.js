// P5 STUFF

//create color variables to store rgb for each client
//we will send this to the server!
var myFillR, myFillG, myFillB;

// sound
var noisey, env, analyzer;
var bpFilter
var when, lastWhen;
var circleSize, circleSizeR;

var noiseyR, envR;
var bpFilterR

var mouseXR, mouseYR;


function setup() {
	createCanvas(windowWidth, windowHeight);
	
	/*for drawing things, usually 
	have background in setup */
	background('violet'); 

	//generate a random color for each color var
	myFillR = floor(random(0, 100));
	myFillG = floor(random(100, 255));
	myFillB = floor(random(200, 255));

	// sound
	bpFilter = new p5.BandPass();
  	noisey = new p5.Noise('pink'); // other types include 'brown' and 'pink'

  	bpFilterR = new p5.BandPass();
  	noiseyR = new p5.Noise('pink'); // other types include 'brown' and 'pink'

// disconnect it from going directly to output
  	noisey.disconnect();
  	noiseyR.disconnect();
  	// noise => filter => speakers
  	noisey.connect(bpFilter);
  	noiseyR.connect(bpFilterR);
  	// make sound
  	noisey.start();
  	noiseyR.start();
    // make filter peaky
  	bpFilter.res(20);
  	bpFilterR.res(20);
    // turn sound off to begin
    noisey.amp(0);
  	noiseyR.amp(0);

    // envelope objects
  	env = new p5.Env();
  	envR = new p5.Env();

    // set attackTime, decayTime, sustainRatio, releaseTime
  	env.setADSR(0.001, 0.1, 0.2, 0.1);
  	env.setRange(1, 0);

  	envR.setADSR(0.001, 0.1, 0.2, 0.1);
  	envR.setRange(1, 0);

  // p5.Amplitude will analyze all sound in the sketch
  // unless the setInput() method is used to specify an input.
  	analyzer = new p5.Amplitude();

    // initial circle size
  	circleSize = circleSizeR = 5;
}

function draw() {
	// check time // beat every 150 milliseconds
	when = millis() % 150;

	// new Beat:
  	if (when < lastWhen) {
  		// reset circle on each beat
    	
    	// print((height - mouseY) / height);    
    	if ((height - mouseY)  > random(height)) { // the higher in the window the more likely to triger
        // if so make noise and make circle great again
      		env.play(noisey);
      		circleSize = 50;
    	}

      // same for remote mouse
    	if ((height - mouseYR)  > random(height)) { // the higher in the window the more likely to triger
      	envR.play(noiseyR);
      	circleSizeR = 50;
    	}
  	}
	//

	stroke(255);
	fill(30, 50, 100, 10);
	rect(0, 0, canvas.width, canvas.height)
	// background(50, 100, 100);
	
	//send our drawing EVERY time draw loops through
	//value that we pass in is a JSON object
	sendDrawing({
		'x': mouseX,
		'y': mouseY,
		'r': myFillR,
		'g': myFillG,
		'b': myFillB
	});

	var freq = map(mouseX, 0, width, 20, 5000);
 	bpFilter.freq(freq);

  	// get volume reading from the p5.Amplitude analyzer
  	var level = analyzer.getLevel();

  	// use level to draw a green rectangle
  	var levelHeight = map(level*3, 0, .4, 0, height);
  	fill(100, 250, 100);
  	rect(0, height, width, -levelHeight);

  	lastWhen = when;
  
  	fill(myFillR, myFillG, myFillB);
  	ellipse(mouseX, mouseY, circleSize, circleSize);
  	if(circleSize > 5){
    	circleSize -= 4;
  	}
  	if(circleSizeR > 5){
    	circleSizeR -= 4;
  	}
}

//SEND MY DRAWING DATA 
//'message' is a JSON object that includes x, y, r, g, b
function sendDrawing(message){
//	p2psocket.emit('drawing', message);  // socket.emit('drawing', message);
 	// console.log(message);
}

function drawOther(someX, someY, someR, someG, someB){
	fill(someR, someG, someB);
	ellipse(someX, someY, circleSizeR, circleSizeR);

	mouseYR = someY;
	mouseXR = someX;
}

function newSynth(){
	console.log("gonna make a new synth");
}

function removeSynth(){
	console.log("gonna remove a synth");
}
