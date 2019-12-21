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

function roughSizeOfObject(object) {

    var objectList = [];
    var stack = [object];
    var bytes = 0;

    while (stack.length) {
        var value = stack.pop();

        if (typeof value === 'boolean') {
            bytes += 4;
        }
        else if (typeof value === 'string') {
            bytes += value.length * 2;
        }
        else if (typeof value === 'number') {
            bytes += 8;
        }
        else if
            (
            typeof value === 'object'
            && objectList.indexOf(value) === -1
        ) {
            objectList.push(value);

            for (var i in value) {
                stack.push(value[i]);
            }
        }
    }
    return bytes;
}
var receivedStates = []
socket.on('worldUpdate', function (data) {
    receivedStates.push(data);
    if (receivedStates.length > 3) receivedStates.shift();
});

let sketch = function (p) {
    p.setup = function () {
        p.createCanvas(p.windowWidth - 20, p.windowHeight - 20);

    };

    p.draw = function () {
        p.background(0);
        p.fill(255);
        if (receivedStates.length > 0) {
            let currentState = receivedStates[0];
            currentState.forEach(objCurState => {
                // If there are at least 2 cached state then try to lerp from the current state to the next one;
                if (receivedStates.length > 1) {
                    let id = objCurState.id;
                    let objNextState = receivedStates[1].find(val => val.id == id); // try to find the object with the same id
                    if (objNextState) {
                        // lerp all vertices towards the next state
                        for (let i = 0; i < objCurState.vertices.length; i++) {
                            objCurState.vertices[i].x = p.lerp(objCurState.vertices[i].x, objNextState.vertices[i].x, 0.4);
                            objCurState.vertices[i].y = p.lerp(objCurState.vertices[i].y, objNextState.vertices[i].y, 0.4);
                        }
                    }
                }
                // draw the object in current state
                p.beginShape();
                objCurState.vertices.forEach(vertex => {
                    p.vertex(vertex.x, vertex.y);
                })
                p.endShape(p.CLOSE);
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