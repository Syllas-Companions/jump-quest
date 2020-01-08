import io from 'socket.io-client'
import Matter from 'matter-js'
import Serializer from './utilities/serializer' 

var serializer = Serializer.create();

var socket = io.connect();

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

socket.on('hello', function () {
    socket.emit('requestServerView');
    socket.on('serverStateChanged', function (data) {
        var loadedWorld = serializer.resurrect(data);
        Engine.merge(engine, { world: loadedWorld });
    })
})

// run the engine
Engine.run(engine);

// run the renderer
Render.run(render);