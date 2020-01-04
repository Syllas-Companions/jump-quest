var sockets = {};
import Matter from 'matter-js'
import Character from 'character'
import GameMap from 'game-map'
import Serializer from 'utilities/serializer'

sockets.init = function (server) {
    // socket.io setup
    var io = require('socket.io')(server);


    // TODO: use GameManager instead of throwing code here
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

    var currentMapJson = require("../../../maps/demo.json");
    var currentMap = new GameMap(engine, currentMapJson)

    // add all of the bodies to the world
    World.add(engine.world, [boxA, boxB]);

    var client_map = new Map();
    var server_view = null;
    io.on('connection', function (socket) {
        socket.emit('hello');
        client_map.set(socket.id, { input: null, character: null });
        socket.on('inputUpdate', function (data) {
            client_map.get(socket.id).input = data;
        });

        socket.on('requestClientView', function () {
            console.log("Client " + socket.id + " connected!")
            let character = new Character(engine, { x: 500, y: 500 });
            client_map.get(socket.id).character = character;
            // send current map information for rendering on client
            socket.emit('mapData', {tilesets: currentMap.tilesets, map: currentMap.getStaticObj()});
        })
        socket.on('requestServerView', function () {
            server_view = socket;

        })

        /* CURRENTLY UNNECESSARY */
        // socket.on('getMapData', function () {
        //     // send current map information for rendering on client
        //     socket.emit('mapData', currentMap.getStaticObj());
        // })

        socket.on('disconnect', function () {
            if (!server_view || socket.id != server_view.id) {
                console.log('Client ' + socket.id + ' disconnected!');
                client_map.get(socket.id).character.destroy();
                client_map.delete(socket.id);
            }
        });
    });

    Events.on(engine, 'beforeUpdate', function () {
        client_map.forEach((client_info, key, map) => {
            if (client_info.character && client_info.input) {
                client_info.character.inputHandler(client_info.input);
                client_info.character.update();
            }

        })
    })

    // run the engine
    setInterval(function () {
        Engine.update(engine, 1000 / 60);

    }, 1000 / 60);

    // send world to server view 10 times per sec
    setInterval(function () {
        if (server_view != null) {
            server_view.emit('serverStateChanged', Serializer.serialise(serializer, engine.world));
        }
    }, 1000 / 10);

    function getCharactersRenderObj() {
        let objects = []
        client_map.forEach((client_info, key, map) => {
            if (client_info.character) {
                let c = client_info.character.bodyC;
                let vertices_arr = []
                c.vertices.forEach((vertex) => {
                    vertices_arr.push({ x: vertex.x, y: vertex.y });
                })
                let obj = {
                    id: c.id,
                    vertices: vertices_arr,
                    tile_id: c.tile_id,
                    position: c.position
                }
                objects.push(obj);
            }
        })
        return objects
    }

    // send world to client views 20 times per sec
    setInterval(function () {
        // send only information of characters and movable objects
        
        // create a minimized list of object to send
        let objects = []
        objects = objects.concat(currentMap.getMovingObj(), getCharactersRenderObj())
        io.emit('worldUpdate', objects)
    }, 1000 / 20)

}

export default sockets;