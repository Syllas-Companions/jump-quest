import GameManager from "controllers/game_manager";

var io;
export default {
    lastRoomId: 0,
    rooms: new Map(),
    client_room_map: new Map(),
    joinGame(socket, characterInfo) {
        if (characterInfo) {
            socket.characterInfo = characterInfo;
        } else {
            // first time joining the game // default value for character
            socket.characterInfo = {
                name: socket.id,
                defaultFace: '⚆  v  ⚆',
                color: '#' + Math.floor(Math.random() * 16777215).toString(16)
            }
        }
        this.joinRoomN(socket, 'lobby');
    },
    leaveRoom(socket) {
        let curRoom = socket.room;
        curRoom.deleteCharacter(socket.id);
        socket.leave(curRoom.id);
        if (curRoom.id != 'lobby' && curRoom.getPlayerCount() == 0)
            this.removeRoom(curRoom.id);
        socket.room = null;
        socket.character = null;
    },
    joinRoomN(socket, roomId) {
        let room = this.getRoom(roomId);
        if (socket.characterInfo && !socket.character) {
            let character = room.createCharacter(socket.id, socket.characterInfo)
            socket.room = room;
            socket.character = character;
            socket.join(roomId);
            // send current map information for rendering on client
            socket.emit('mapData', {
                name: room.id,
                background: room.currentMap.background,
                tilesets: room.currentMap.tilesets,
                map: room.currentMap.getStaticObj()
            });
            socket.emit('characterData', character.metadata);
        }
    },
    getRoom(roomId) {
        if (!this.rooms.has(roomId)) { // if room not exists 
            return this.createRoom(roomId);
        } else
            return this.rooms.get(roomId);

    },
    createRoom(roomId) {
        let room = new GameManager(roomId);
        room.loseCallback = function () {
            // this.destroyRoom(roomId);
            this.gameOver(roomId);
        }.bind(this);
        room.start();
        this.rooms.set(room.id, room);
        return room;
    },
    removeRoom(roomId, isForce = false) {
        let room = this.rooms.get(roomId);
        if (!isForce) {
            if (room.id != 'lobby' && room.getPlayerCount() == 0 && room.hp <= 0) {
                this.rooms.delete(room.id);
            }
        } else {
            // force remove room => need to throw all players out
            io.sockets.adapter.rooms[room.id].forEach(socket => {
                this.leaveRoom(socket);
            });
            this.rooms.delete(room.id);
        }
    },
    gameOver(roomId) {
        io.in(roomId).emit('gameOver');
        this.removeRoom(roomId, true);
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
                if (socket.room)
                    socket.room.updateInput(socket.id, data);
            });

            socket.on('userMessage', function (message) {
                // add message to character
                socket.character.addUserMessage(message)
            })

            socket.on('responseRoomName', (roomId) => {
                waitingResponseList = waitingResponseList.filter(id => id != socket.id);
                if (roomId != null && roomId != "") {
                    context.leaveRoom(socket);
                    context.joinRoomN(socket, roomId)
                }
            })
            /** data: {roomId} */
            socket.on('joinGame', (characterData) => {
                context.joinGame(socket, characterData)
            });

            socket.on('joinRoom', (roomId) => {
                if(socket.room){
                    context.leaveRoom(socket);
                }
                context.joinRoomN(socket, roomId)
            });

            socket.on('updateCharacterData', (data) => {
                socket.character.metadata = data;
                socket.character.faceAscii = data.defaultFace;
                socket.emit('characterData', data);
            })

            socket.on('disconnect', () => {
                console.log('DISCONNECTED: ' + socket.id);
                context.leaveRoom(socket);
            });
        });

        setInterval(function () {
            // loop through worlds

            // send worlds to client views 20 times per sec
            context.rooms.forEach((room, rId) => {
                io.to(rId).emit('worldUpdate', room.simplify())
            });
        }, 1000 / 20)
    },
}