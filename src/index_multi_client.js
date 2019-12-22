import io from 'socket.io-client'
import p5 from 'p5'
// import Matter from 'matter-js'
// import Character from './character'
// import GameMap from './game-map'
var socket = io.connect();
socket.on('hello', function () {
    console.log("connected!");
});

// var Engine = Matter.Engine,
// 	Render = Matter.Render,
// 	Events = Matter.Events,  
//     World = Matter.World,  
//     Bodies = Matter.Bodies,
//     Body = Matter.Body;

// // create an engine
// var engine = Engine.create(); 

// // create a renderer 
// var render = Render.create({
//     element: document.body,
//     engine: engine
// });

// // create two boxes and a ground
// var boxA = Bodies.rectangle(400, 200, 80, 80);
// var boxB = Bodies.rectangle(250, 50, 80, 80);
// var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true, objType:"ground" });
// var upBar = Bodies.rectangle(0, 0, 2000, 60, { isStatic: true, objType:"ground" });
// var rightBar = Bodies.rectangle(800, 400, 60, 810, { isStatic: true, objType:"ground" });
// var leftBar = Bodies.rectangle(0, 0, 60, 2000, { isStatic: true, objType:"ground" });


// //create new character
// var character = new Character(engine,{x:500, y:500});


//input to move character
var keyState = {}
window.addEventListener('keydown', function (e) {
    keyState[e.keyCode || e.which] = true;
}, true);
window.addEventListener('keyup', function (e) {
    keyState[e.keyCode || e.which] = false;
}, true);


setInterval(() => {
    socket.emit("inputUpdate", keyState);
}, 20);

var receivedStates = []
socket.on('worldUpdate', function (data) {
    receivedStates.push({ timestamp: new Date().getTime()+100, data: data });
    //if (receivedStates.length > 3) receivedStates.shift();
});

let sketch = function (p) {
    p.setup = function () {
        p.createCanvas(p.windowWidth - 20, p.windowHeight - 20);
        p.frameRate(60)
    };
    p.keyPressed = function () {
        if (p.keyCode === p.ENTER) {
            console.log(receivedStates);
        }
    }
    p.draw = function () {
        p.background(0);
        p.stroke(160);
        p.noFill();
        let curTime = new Date().getTime();
        if (receivedStates.length > 0) {
            let currentState = receivedStates[0].data;
            currentState.forEach(objCurState => {
                // If there are at least 2 cached state then try to add frames to transit from the current state to the next one;
                if (receivedStates.length > 1) {
                    let id = objCurState.id;
                    let objNextState = receivedStates[1].data.find(val => val.id == id); // try to find the object with the same id (aka same object in next state)
                    if (objNextState) {
                        // draw frames in middle
                        p.beginShape();
                        for (let i = 0; i < objCurState.vertices.length; i++) {
                            // p.vertex(
                            //     p.map(curTime, receivedStates[0].timestamp, receivedStates[1].timestamp,objCurState.vertices[i].x,objNextState.vertices[i].x,true),
                            //     p.map(curTime, receivedStates[0].timestamp, receivedStates[1].timestamp,objCurState.vertices[i].y,objNextState.vertices[i].y,true)
                            // )
                            objCurState.vertices[i].x = p.lerp(objCurState.vertices[i].x, objNextState.vertices[i].x, 0.3);
                            objCurState.vertices[i].y = p.lerp(objCurState.vertices[i].y, objNextState.vertices[i].y, 0.3);
                            p.vertex(objCurState.vertices[i].x, objCurState.vertices[i].y);
                        }
                        p.endShape(p.CLOSE)
                    }
                    if(curTime>receivedStates[1].timestamp) receivedStates.shift();
                } 
                else 
                {
                    // draw the object in current state
                    p.beginShape();
                    objCurState.vertices.forEach(vertex => {
                        p.vertex(vertex.x, vertex.y);
                    })
                    p.endShape(p.CLOSE);
                }
            });
        }
    };
};
let p5_instance = new p5(sketch);

// Events.on(engine, 'beforeUpdate', function(){
// 	character.inputHandler(keyState)
//     character.update()
// })

// var currentMap = null;
// fetch("/maps/demo.json")
// .then(res=>{
//     return res.json()
// }).then(res=>{
//     currentMap = new GameMap(engine,res)
//     console.log(engine.world)
// })

// // add all of the bodies to the world
// World.add(engine.world, [boxA, boxB, ground,leftBar,rightBar,upBar]);

// // run the engine
// Engine.run(engine);

// // run the renderer
// Render.run(render);