import GameManager from "game_manager";

var io;
export default {
    lastRoomId: 0,
    rooms: new Map(),
    client_room_map: new Map(),
    init: function (server) {
        // socket.io setup
        io = require('socket.io')(server);

        let context = this;

        let lobby = new GameManager('lobby');
        lobby.start();

        this.rooms.set(lobby.id, lobby);

        io.on('connection', function (socket) {
            socket.emit('hello');
            socket.on('pingRequest', function () { // MTODO: should move somewhere else
                socket.emit('pongResponse');
            });
            socket.on('inputUpdate', function (data) {
                if (context.client_room_map.get(socket.id) && context.rooms.get(context.client_room_map.get(socket.id)))
                    context.rooms.get(context.client_room_map.get(socket.id)).updateInput(socket.id, data);
            });

            /** data: {roomId} */
            socket.on('joinGame', function (data) {
                let targetRoom;
                if (!context.client_room_map.has(socket.id)) {
                    console.log("NEW CLIENT: " + socket.id);
                    targetRoom = lobby;
                } else {
                    if (!data || !data.roomId) return;
                    // client move to another room (managed by another GameManager)
                    if (!rooms.has(data.roomId)) { // if room not exists
                        targetRoom = new GameManager(data.roomId);
                        targetRoom.start();
                        context.rooms.set(targetRoom.id, targetRoom)
                    } else { // room exists
                        targetRoom = rooms.get(data.roomId);
                    }
                    // remove character from the current room
                    let curRoom = context.client_room_map.get(socket.id);
                    context.rooms.get(curRoom).deleteCharacter(socket.id);
                    socket.leave(curRoom);
                }
                // add him to the target room
                targetRoom.createCharacter(socket.id)
                context.client_room_map.set(socket.id, targetRoom.id)
                socket.join(targetRoom.id);
                // send current map information for rendering on client
                socket.emit('mapData', { tilesets: targetRoom.currentMap.tilesets, map: targetRoom.currentMap.getStaticObj() });
            });
            socket.on('disconnect', function () {
                console.log('DISCONNECTED: ' + socket.id);
                if (context.client_room_map.get(socket.id) && context.rooms.get(context.client_room_map.get(socket.id))) {
                    context.rooms.get(context.client_room_map.get(socket.id)).deleteCharacter(socket.id);
                    // NOTE: socket.leave automatically excuted as client disconnected
                    context.client_room_map.delete(socket.id);
                }
            });
        });

        // send worlds to client views 20 times per sec
        setInterval(function () {
            // loop through worlds
            context.rooms.forEach((room, rId) => {
                // send only information of characters and movable objects
                // create a minimized list of object to send
                let objects = []
                objects = objects.concat(room.currentMap.getMovingObj(), room.getCharactersRenderObj())
                io.to(rId).emit('worldUpdate', objects)
            });
        }, 1000 / 20)
    },

}

// MTODO: AFTER TESTING MULTI ROOM w/ SAME MAP: (IDEA) room id might be in form a#b, where a is the room number and b is the 
//                                              current level. This way, each level of each room is managed by a game manager.
//                                              For example a player might go from lobby -> 001#0 (0 - wait room) -> 001#1 -> 001#2
//                 Door should be able to activate room/level changing procedure (move to next level of the same room number)
//                 or from lobby to a room of choice
//                  => add 2 functions for Door

