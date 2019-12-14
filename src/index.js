import io from 'socket.io-client'
import Matter from 'matter-js'
import { MatterCollisionEvents } from 'matter-collision-events';
import Character from './character'

var socket = io.connect();
socket.on('hello', function () {
    console.log("connected!");
});

Matter.use(MatterCollisionEvents);

var Engine = Matter.Engine,
	Render = Matter.Render,
	Events = Matter.Events,  
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
var boxB = Bodies.rectangle(250, 50, 80, 80);
var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true, objType:"ground" });
console.log(ground)
var upBar = Bodies.rectangle(0, 0, 2000, 60, { isStatic: true, objType:"ground" });
var rightBar = Bodies.rectangle(800, 400, 60, 810, { isStatic: true, objType:"ground" });
var leftBar = Bodies.rectangle(0, 0, 60, 2000, { isStatic: true, objType:"ground" });


//create new character
var character = new Character(engine,{x:500, y:500});

//variable for jump
var timeStart = 0;
var timeEnd = 0;
var deltaTime = 0;
var forceJump = 0;


//input to move character
var keyState = {}
window.addEventListener('keydown',function(e){
    keyState[e.keyCode || e.which] = true;
},true);    
window.addEventListener('keyup',function(e){
    keyState[e.keyCode || e.which] = false;
},true);

Events.on(engine, 'beforeUpdate', function(){
	character.inputHandler(keyState)
})
// add all of the bodies to the world
World.add(engine.world, [boxA, boxB, ground,leftBar,rightBar,upBar]);

// run the engine
Engine.run(engine);

// run the renderer
Render.run(render);