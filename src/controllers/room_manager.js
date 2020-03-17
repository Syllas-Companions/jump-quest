import GameManager from "controllers/game_manager";

var io;
export default {
    lastRoomId: 0,
    rooms: new Map(),
    client_room_map: new Map(),
    destroyRoom: function (roomId) {
        // function to remove the room when hp = 0, and cast all player inside back to lobby
        // let room = this.rooms.get(roomId);
        // console.log(roomId);
        io.in(roomId).emit('gameOver', 'lobby'); // call all client in room to safely quit the room (require client to call joinRoom(lobby))
        // this.rooms.delete(roomId);

    },
    joinRoom: function (socket, roomId, characterData) {
        let targetRoom, character_metadata = null;
        if (!this.client_room_map.has(socket.id)) {
            console.log("NEW CLIENT: " + socket.id);
            targetRoom = this.rooms.get("lobby");
        } else {
            // do not do anything player already in that room
            if (this.client_room_map.get(socket.id) == roomId) return;
            if (!roomId) return;
            // client move to another room (managed by another GameManager)
            if (!this.rooms.has(roomId)) { // if room not exists 
                targetRoom = new GameManager(roomId);
                targetRoom.loseCallback = function () {
                    this.destroyRoom(roomId);
                    // console.log('logged out');
                }.bind(this);
                targetRoom.start();
                this.rooms.set(targetRoom.id, targetRoom)
            } else { // room exists
                targetRoom = this.rooms.get(roomId);
            }
            // remove character from the current room
            let curRoom = this.client_room_map.get(socket.id);
            // save character metadata when moving to new room
            characterData = this.rooms.get(curRoom).deleteCharacter(socket.id);
            socket.leave(curRoom);
        }
        // add him to the target room
        let character = targetRoom.createCharacter(socket.id, characterData)
        this.client_room_map.set(socket.id, targetRoom.id)
        socket.character = character;
        socket.join(targetRoom.id);
        // send current map information for rendering on client
        socket.emit('mapData', {
            name: targetRoom.id,
            background: targetRoom.currentMap.background,
            tilesets: targetRoom.currentMap.tilesets,
            map: targetRoom.currentMap.getStaticObj()
        });
        socket.emit('characterData', character.metadata);
    },
    init: function (server) {
        // socket.io setup
        io = require('socket.io')(server);
        this.lastRoomId = 100;
        let context = this;

        let waitingResponseList = []

        // create lobby
        let lobby = new GameManager('lobby', 'lobby');
        lobby.hp = Infinity;
        lobby.decreaseHp = function () { }
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
                let roomId = context.client_room_map.get(socket.id);
                let room = roomId ? context.rooms.get(roomId) : null;
                if (room)
                    room.updateInput(socket.id, data);
            });

            socket.on('userMessage', function (message) {
                // add message to character
                socket.character.addUserMessage(message)
            })

            socket.on('responseRoomName', (roomId) => {
                waitingResponseList = waitingResponseList.filter(id => id != socket.id);
                if (roomId != null && roomId != "")
                    context.joinRoom(socket, roomId)
            })
            /** data: {roomId} */
            socket.on('joinGame', function (roomId, characterData) {
                if (roomId != null && roomId != "")
                    context.joinRoom(socket, roomId, characterData)
            });

            socket.on('updateCharacterData', (data) => {
                socket.character.metadata = data;
                socket.character.faceAscii = data.defaultFace;
                socket.emit('characterData', data);
            })

            socket.on('disconnect', function () {
                console.log('DISCONNECTED: ' + socket.id);
                if (context.client_room_map.get(socket.id) && context.rooms.get(context.client_room_map.get(socket.id))) {
                    context.rooms.get(context.client_room_map.get(socket.id)).deleteCharacter(socket.id);
                    // NOTE: socket.leave automatically excuted as client disconnected
                    context.client_room_map.delete(socket.id);
                }
            });
        });

        setInterval(function () {
            // loop through worlds

            // send worlds to client views 20 times per sec
            context.rooms.forEach((room, rId) => {
                // check and remove room without any player
                if (room.id != 'lobby' && room.getPlayerCount() == 0 && room.hp <= 0) {
                    context.rooms.delete(rId);
                    console.log("World '" + room.id + "' has fallen!")
                    console.log("Worlds remaining: " + context.rooms.size)
                    return;
                }
                io.to(rId).emit('worldUpdate', room.simplify())
            });
        }, 1000 / 20)
    },
}