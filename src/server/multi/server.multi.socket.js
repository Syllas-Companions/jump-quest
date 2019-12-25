var sockets = {};
import Matter from 'matter-js'
import Character from 'character'
import GameMap from 'game-map'
import Serializer from 'utilities/serializer'

sockets.init = function (server) {
    // socket.io setup
    var io = require('socket.io')(server);


    var serializer = Serializer.create();
    var Engine = Matter.Engine,
        Render = Matter.Render,
        Events = Matter.Events,
        World = Matter.World,
        Bodies = Matter.Bodies,
        Body = Matter.Body;

    // create an engine
    var engine = Engine.create();

    // create two boxes and a ground
    var boxA = Bodies.rectangle(400, 200, 80, 80);
    var boxB = Bodies.rectangle(250, 50, 80, 80);
    var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true, objType: "ground" });
    var upBar = Bodies.rectangle(0, 0, 2000, 60, { isStatic: true, objType: "ground" });
    var rightBar = Bodies.rectangle(800, 400, 60, 810, { isStatic: true, objType: "ground" });
    var leftBar = Bodies.rectangle(0, 0, 60, 2000, { isStatic: true, objType: "ground" });

    var currentMapJson = require("../../../maps/demo.json");
    var currentMap = new GameMap(engine, currentMapJson)

    // add all of the bodies to the world
    World.add(engine.world, [boxA, boxB, ground, leftBar, rightBar, upBar]);

    var client_character_map = new Map();
    var client_input_map = new Map();
    var server_view = null;
    io.on('connection', function (socket) {
        socket.emit('hello');

        socket.on('inputUpdate', function (data) {
            client_input_map.set(socket.id, data);
        });

        socket.on('requestClientView', function () {
            console.log("Client " + socket.id + " connected!")
            let character = new Character(engine, { x: 500, y: 500 });
            client_character_map.set(socket.id, character);
        })
        socket.on('requestServerView', function () {
            server_view = socket;

        })

        socket.on('disconnect', function () {
            if (!server_view || socket.id != server_view.id) {
                console.log('Client ' + socket.id + ' disconnected!');
                client_character_map.get(socket.id).destroy();
                client_character_map.delete(socket.id);
                client_input_map.delete(socket.id);
            }
        });
    });

    Events.on(engine, 'beforeUpdate', function () {
        client_character_map.forEach((value, key, map) => {
            if (client_input_map.has(key)) {
                value.inputHandler(client_input_map.get(key));
                value.update();
            }
        })
    })

    // run the engine
    setInterval(function () {
        Engine.update(engine, 1000 / 60);

    }, 1000 / 60);

    setInterval(function () {
        if (server_view != null) {
            server_view.emit('serverStateChanged', Serializer.serialise(serializer, engine.world));
        }
    }, 1000 / 10);

    setInterval(function () {
        let objects = []
        engine.world.bodies.forEach((body) => {
            let vertices_arr = []
            body.vertices.forEach((vertex) => {
                vertices_arr.push({ x: vertex.x, y: vertex.y });
            })
            let obj = {
                id: body.id,
                vertices: vertices_arr
            }
            objects.push(obj);
        })

        io.emit('worldUpdate', objects)
    }, 1000 / 20)

}

export default sockets;