import io from 'socket.io-client'
import Matter from 'matter-js'
import Character from './character'

var socket = io.connect();
socket.on('hello', function () {
    console.log("connected!");
});
var Engine = Matter.Engine,
    Render = Matter.Render,  
    World = Matter.World,  
    Bodies = Matter.Bodies,
    Body = Matter.Body;

// create an engine
var engine = Engine.create(); 

// create a renderer 
var render = Render.create({
    element: document.body,
    engine: engine
});

// create two boxes and a ground
var boxA = Bodies.rectangle(400, 200, 80, 80);
var boxB = Bodies.rectangle(450, 50, 80, 80);
var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });
var upBar = Bodies.rectangle(0, 0, 2000, 60, { isStatic: true });
var rightBar = Bodies.rectangle(800, 400, 60, 810, { isStatic: true });
var leftBar = Bodies.rectangle(0, 0, 60, 2000, { isStatic: true });


//create new character
var character = new Character(engine.world,{x:500, y:500});

//variable for jump
var timeStart = 0;
var timeEnd = 0;
var deltaTime = 0;
var forceJump = 0;

//set status 
	character.isJumping = false;

//input to move character
document.addEventListener('keyup', function(event) {

	console.log(event.keyCode);
	// Body.applyForce(boxA,{x:boxA.position.x,y:boxA.position.y},{x:0.0,y:-0.05});
	//function move 
	if(event.keyCode === 37||event.keyCode === 39){
		character.move(event.keyCode);
	}
	//function jump
	if(event.keyCode === 38){
		var timeNow = new Date();
		timeEnd = timeNow.getTime();
		deltaTime = timeEnd - timeStart ;
		console.log("time for force  = " +deltaTime);
		forceJump = deltaTime/4000;
		console.log("check");
		character.jump(forceJump);
		character.isJumping = false;
		character.isChanneling = false;
	}
});	
document.addEventListener('keydown',function(event){
	//variable keydown
	var timeStartPressDown = new Date(); //time start press
	if(event.keyCode === 38){
		var timeNow = new Date();
		timeStart = timeNow.getTime();
		// console.log(timeStart);
	}
});

// add all of the bodies to the world
World.add(engine.world, [boxA, boxB, ground,leftBar,rightBar,upBar]);

// run the engine
Engine.run(engine);

// run the renderer
Render.run(render);