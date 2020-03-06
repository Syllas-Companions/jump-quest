import GameManager from "game_manager";

var io;
export default {
    lastRoomId: 0,
    rooms: new Map(),
    client_room_map: new Map(),
    joinRoom: function (socket, roomId) {
        let targetRoom, character_metadata = null;
        if (!this.client_room_map.has(socket.id)) {
            console.log("NEW CLIENT: " + socket.id);
            targetRoom = this.rooms.get("lobby");
        } else {
            if (!roomId) return;
            // client move to another room (managed by another GameManager)
            if (!this.rooms.has(roomId)) { // if room not exists 
                targetRoom = new GameManager(roomId);
                targetRoom.start();
                this.rooms.set(targetRoom.id, targetRoom)
            } else { // room exists
                targetRoom = this.rooms.get(roomId);
            }
            // remove character from the current room
            let curRoom = this.client_room_map.get(socket.id);
            // save character metadata when moving to new room
            character_metadata = this.rooms.get(curRoom).deleteCharacter(socket.id);
            socket.leave(curRoom);
        }
        // add him to the target room
        let character = targetRoom.createCharacter(socket.id,character_metadata)
        this.client_room_map.set(socket.id, targetRoom.id)
        socket.join(targetRoom.id);
        // send current map information for rendering on client
        socket.emit('mapData',
            {
                name: targetRoom.id,
                background: targetRoom.currentMap.background,
                tilesets: targetRoom.currentMap.tilesets,
                map: targetRoom.currentMap.getStaticObj()
            });
    },
    init: function (server) {
        // socket.io setup
        io = require('socket.io')(server);
        this.lastRoomId = 100;
        let context = this;

        let waitingResponseList = []
        let lobby = new GameManager('lobby');
        lobby.start();
        // override lobby's nextMap function
        lobby.nextMap = (function (character, door) {
            if (waitingResponseList.every(id => id != character.id)) {
                io.to(character.id).emit('requestRoomName');
                waitingResponseList.push(character.id);
            }
        }).bind(lobby);

        this.rooms.set(lobby.id, lobby);

        io.on('connection', function (socket) {
            socket.on('pingRequest', function () {
                socket.emit('pongResponse');
            });
            socket.on('inputUpdate', function (data) {
                if (context.client_room_map.get(socket.id) && context.rooms.get(context.client_room_map.get(socket.id)))
                    context.rooms.get(context.client_room_map.get(socket.id)).updateInput(socket.id, data);
            });

            socket.on('responseRoomName', (roomId) => {
                waitingResponseList = waitingResponseList.filter(id => id != socket.id);
                if (roomId != null && roomId != "")
                    context.joinRoom(socket, roomId)
            })
            /** data: {roomId} */
            socket.on('joinGame', function (roomId) {
                if (roomId != null && roomId != "")
                    context.joinRoom(socket, roomId)
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
                io.to(rId).emit('worldUpdate', {
                    hp: room.hp,
                    objects
                })
            });
        }, 1000 / 20)
    },
}
