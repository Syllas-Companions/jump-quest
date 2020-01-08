var sockets = {};
import Matter from 'matter-js'
import Character from 'character'
import GameMap from 'game-map'
import Serializer from 'utilities/serializer'
import GameManager from 'game_manager'

sockets.init = function (server) {
    // socket.io setup
    var io = require('socket.io')(server);

    // var serializer = Serializer.create();

    var game_manager = new GameManager();
    game_manager.start();

    // var server_view = null;
    io.on('connection', function (socket) {
        socket.emit('hello');
        socket.on('pingRequest', function () {
            socket.emit('pongResponse');
        });
        socket.on('inputUpdate', function (data) {
            game_manager.updateInput(socket.id, data);
        });

        socket.on('requestClientView', function () {
            console.log("Client " + socket.id + " connected!")
            game_manager.createCharacter(socket.id);
            // send current map information for rendering on client
            socket.emit('mapData', { tilesets: game_manager.currentMap.tilesets, map: game_manager.currentMap.getStaticObj() });
        })
        // socket.on('requestServerView', function () {
        //     server_view = socket;
        // })

        /* UNUSED */
        // socket.on('getMapData', function () {
        //     // send current map information for rendering on client
        //     socket.emit('mapData', currentMap.getStaticObj());
        // })

        socket.on('disconnect', function () {
            // if (!(server_view && socket.id == server_view.id)) {
                console.log('Client ' + socket.id + ' disconnected!');
                game_manager.deleteCharacter(socket.id);
            // }
        });
    });

    // send world to server view 10 times per sec
    // setInterval(function () {
    //     if (server_view != null) {
    //         server_view.emit('serverStateChanged', Serializer.serialise(serializer, game_manager.engine.world));
    //     }
    // }, 1000 / 10);

    // send world to client views 20 times per sec
    setInterval(function () {
        // send only information of characters and movable objects
        // create a minimized list of object to send
        let objects = []
        objects = objects.concat(game_manager.currentMap.getMovingObj(), game_manager.getCharactersRenderObj())
        io.emit('worldUpdate', objects)
    }, 1000 / 20)

}

export default sockets;