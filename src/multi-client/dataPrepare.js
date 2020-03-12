import io from 'socket.io-client'
import tileset_manager from 'controllers/tileset_manager'

// var clientState = {
//     isAlive: true,
//     id: null,
//     latency: 100,
//     hp: 0,
//     mapData: null,
//     dynamicData: null
// }

// var socket = io.connect();
export default function (socket, clientState) {
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



    setInterval(() => {
        if (clientState.sendingInput) {
            socket.emit("inputUpdate", clientState.keyState);
        } else {
            socket.emit("inputUpdate", {});
        }
    }, 20);

    socket.on('requestRoomName', function () {
        var roomName = prompt("Please enter room name", "room001");
        // check if room name valid
        if (roomName && roomName != "") {
            socket.emit('responseRoomName', roomName);
            clientState.keyState = {}
        } else {
            alert('Room name must not be empty');
        }
    })

    socket.on('gameOver', function (data) {
        console.log("gameover")
        // TODO: show message or such (when GUI's ready)
        socket.emit('joinGame', 'lobby');
    });

    var MAX_SAVED_STATE = 4
    clientState.dynamicData = new Map()
    socket.on('worldUpdate', function (data) {
        let timestamp = new Date().getTime() + 50; // TODO: might be better when considering ping in place of constant
        let { objects, ...worldMetadata } = data;

        Object.assign(clientState, worldMetadata); // update other properties

        // remove objects which are not in this package (objects which are no longer exist)
        clientState.dynamicData.forEach((val, key) => {
            if (objects.every(obj => obj.id != key)) {
                clientState.dynamicData.delete(key);
            }
        })
        // transform the package for easier calculation

        objects.forEach(obj => {
            if (!obj) return;
            if (clientState.dynamicData.has(obj.id)) {
                // old object 
                let objState = clientState.dynamicData.get(obj.id)
                let { vertices, position, ...metaData } = obj;
                Object.assign(objState, metaData); // update other properties

                // update position and vertices in a way easier to use later in calculation
                for (let i = 0; i < objState.vertices.length; i++) {
                    objState.vertices[i].x.push(vertices[i].x);
                    objState.vertices[i].y.push(vertices[i].y);
                    if (objState.vertices[i].x.length > MAX_SAVED_STATE) {
                        objState.vertices[i].x.shift();
                        objState.vertices[i].y.shift();
                    }
                }
                objState.timestamp.push(timestamp)
                objState.position.x.push(position.x);
                objState.position.y.push(position.y);
                if (objState.timestamp.length > MAX_SAVED_STATE) {
                    objState.timestamp.shift();
                    objState.position.x.shift();
                    objState.position.y.shift();
                }
            } else {
                // newly created object
                // local states saved base on this skeleton
                clientState.dynamicData.set(obj.id, Object.assign({}, obj, {
                    timestamp: [timestamp],
                    vertices: obj.vertices.map(vertex => {
                        return { x: [vertex.x], y: [vertex.y] }
                    }),
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

}
// export {sendMessage, clientState};