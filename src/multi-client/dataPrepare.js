import io from 'socket.io-client'
import tileset_manager from 'tileset_manager'

var clientState = {
    isAlive: true,
    id: null,
    latency: 100,
    mapData: null,
    dynamicData: null
}

var socket = io.connect();
socket.on('connect', () => {
    clientState.id = socket.id
    clientState.isAlive = true;
    console.log('hello')
    socket.emit('joinGame', 'lobby');
})
// TODO: add button for returning to lobby
// change client status on disconnection
socket.on('disconnect', (reason) => {
    if (reason === 'io server disconnect') {
        // the disconnection was initiated by the server, you need to reconnect manually
        //   socket.connect();
    }
    console.log(reason)
    clientState.isAlive = false;
    // else the socket will automatically try to reconnect
});
// calculate latency
var pingStartTime;
setInterval(function () {
    pingStartTime = Date.now();
    socket.emit('pingRequest');
}, 1000);

socket.on('pongResponse', function () {
    clientState.latency = Date.now() - pingStartTime;
    // console.log(latency);
});

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

socket.on('requestRoomName', function () {
    var roomName = prompt("Please enter room name", "room001");
    // check if room name valid
    if (roomName && roomName != "") {
        socket.emit('responseRoomName', roomName);
        keyState = {}
    }else{
        alert('Room name must not be empty');
    }
})


var MAX_SAVED_STATE = 4
clientState.dynamicData = new Map()
socket.on('worldUpdate', function (data) {
    let timestamp = new Date().getTime() + 50; // TODO: might be better when considering ping in place of constant

    // remove objects which are not in this package (objects which are no longer exist)
    clientState.dynamicData.forEach((val, key) => {
        if (data.every(obj => obj.id != key)) {
            clientState.dynamicData.delete(key);
        }
    })
    // (obj definition in game_manager.getCharactersRenderObj)
    // transform the package for easier calculation
    data.forEach(obj => {
        if (clientState.dynamicData.has(obj.id)) {
            // old object 
            let objState = clientState.dynamicData.get(obj.id)
            for (let i = 0; i < objState.vertices.length; i++) {
                objState.vertices[i].x.push(obj.vertices[i].x);
                objState.vertices[i].y.push(obj.vertices[i].y);
                if (objState.vertices[i].x.length > MAX_SAVED_STATE) {
                    objState.vertices[i].x.shift();
                    objState.vertices[i].y.shift();
                }
            }
            objState.timestamp.push(timestamp)
            objState.position.x.push(obj.position.x);
            objState.position.y.push(obj.position.y);
            if (objState.timestamp.length > MAX_SAVED_STATE) {
                objState.timestamp.shift();
                objState.position.x.shift();
                objState.position.y.shift();
            }
        } else {
            // newly created object
            // local states saved base on this skeleton
            clientState.dynamicData.set(obj.id, Object.assign({},obj,{
//                id: obj.id,
                timestamp: [timestamp],
//                metadata: obj.metadata,
//                client_id: obj.client_id,
                vertices: obj.vertices.map(vertex => {
                    return { x: [vertex.x], y: [vertex.y] }
                }),
//                tile_id: obj.tile_id,
                position: {
                    x: [obj.position.x],
                    y: [obj.position.y]
                }
            }))
        }
    });
});

clientState.mapData = { name: "", background: "", tilesets: [], map: [] }
socket.on('mapData', function (data) {
    clientState.mapData = Object.assign(clientState.mapData, data);
    tileset_manager.getBackground(clientState.mapData.background)
    // Load all tilesets
    clientState.mapData.tilesets.forEach(ts => {
        tileset_manager.loadTileset(ts.source);
    })
});

export default clientState;