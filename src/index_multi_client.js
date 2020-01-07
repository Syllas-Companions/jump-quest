import io from 'socket.io-client'
import p5 from 'p5'
import { polynomial } from 'everpolate'
import tileset_manager from 'tileset_manager'
import camera from 'camera'

var socket = io.connect();
socket.on('hello', function () {
    console.log("connected!");
    socket.emit('requestClientView');
});

// calculate latency for future uses
var pingStartTime;
var latency;
setInterval(function () {
    pingStartTime = Date.now();
    socket.emit('pingRequest');
}, 1000);

socket.on('pongResponse', function () {
    latency = Date.now() - pingStartTime;
    console.log(latency);
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

var receivedStates = []
var MAX_SAVED_STATE = 4
var objectData = new Map()
socket.on('worldUpdate', function (data) {
    let timestamp = new Date().getTime() + 50; // TODO: might be better when considering ping in place of constant
    receivedStates.push({ timestamp: timestamp + 100, data: data });

    // (obj definition in game_manager.getCharactersRenderObj)
    data.forEach(obj => {
        if (objectData.has(obj.id)) {
            let objState = objectData.get(obj.id)
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
            // local states saved base on this skeleton
            objectData.set(obj.id, {
                id: obj.id,
                timestamp: [timestamp],
                client_id: obj.client_id,
                vertices: obj.vertices.map(vertex => {
                    return { x: [vertex.x], y: [vertex.y] }
                }),
                tile_id: obj.tile_id,
                position: {
                    x: [obj.position.x],
                    y: [obj.position.y]
                }
            })
        }
    });
});

var mapData = { tilesets: [], map: [] }
socket.on('mapData', function (data) {
    mapData = data;
    // Load all tilesets
    mapData.tilesets.forEach(ts => {
        tileset_manager.loadTileset(ts.source);
    })
});

// DEBUG //
let sketch = function (p) {
    p.drawMovingObjs = function () {
        let timestamp = new Date().getTime();
        p.push();
        objectData.forEach((obj, id) => {
            if (socket.id == obj.client_id) {
                camera.towards(obj.position.x[obj.position.x.length - 1], obj.position.y[obj.position.y.length - 1]);
                window.camera = camera;
            }
            let prediction = (obj.timestamp.length >= 3);
            p.stroke(155, 155, 0);
            p.noFill();
            p.beginShape();
            obj.vertices.forEach(vertex => {
                if (prediction) {
                    let x_prediction = polynomial(timestamp, obj.timestamp, vertex.x)[0];
                    let y_prediction = polynomial(timestamp, obj.timestamp, vertex.y)[0];
                    p.vertex(x_prediction, y_prediction);
                } else {
                    p.vertex(vertex.x[vertex.x.length - 1], vertex.y[vertex.y.length - 1]);
                }
            })
            p.endShape(p.CLOSE);
        })
        p.pop();
    }
    // p.drawMovingObjs = function () {
    //     p.push();
    //     if (receivedStates.length > 0) {
    //         let currentState = receivedStates[0].data;
    //         currentState.forEach(objCurState => {
    //             // Assign target for camera = character of the current client
    //             if (socket.id == objCurState.client_id) {
    //                 camera.follow(objCurState);
    //                 window.camera = camera;
    //             }
    //             // If there are at least 2 cached state then try to add frames to transit from the current state to the next one;
    //             if (receivedStates.length > 1) {
    //                 p.stroke(160);
    //                 p.noFill();
    //                 let id = objCurState.id;
    //                 let objNextState = receivedStates[1].data.find(val => val.id == id); // try to find the object with the same id (aka same object in next state)
    //                 if (objNextState) {
    //                     // draw frames in middle
    //                     p.beginShape();
    //                     for (let i = 0; i < objCurState.vertices.length; i++) {
    //                         objCurState.vertices[i].x = p.lerp(objCurState.vertices[i].x, objNextState.vertices[i].x, 0.3);
    //                         objCurState.vertices[i].y = p.lerp(objCurState.vertices[i].y, objNextState.vertices[i].y, 0.3);
    //                         p.vertex(objCurState.vertices[i].x, objCurState.vertices[i].y);
    //                     }
    //                     p.endShape(p.CLOSE)
    //                 }
    //                 let curTime = new Date().getTime();
    //                 if (curTime > receivedStates[0].timestamp) receivedStates.shift();
    //             }
    //             else {
    //                 // draw the object in current state
    //                 p.stroke(255, 0, 0);
    //                 p.noFill();
    //                 p.beginShape();
    //                 objCurState.vertices.forEach(vertex => {
    //                     p.vertex(vertex.x, vertex.y);
    //                 })
    //                 p.endShape(p.CLOSE);
    //             }
    //         });
    //     }
    //     p.pop();
    // }
    p.drawMap = function () {
        if (mapData) {
            p.push();
            // Render tiles using tilesheet's information (TileSet and tileset_manager)
            mapData.map.forEach(obj => {
                let tileset = mapData.tilesets.find(ts => {
                    return ts.firstgid < obj.tile_id;
                })
                if (tileset) {
                    let res = tileset_manager.getTile(tileset.source, obj.tile_id)
                    if (res) {
                        // resource ready
                        p.imageMode(p.CENTER);
                        p.image(res.tileset.image, obj.position.x, obj.position.y, 64, 64, res.x, res.y, res.width, res.height);
                    } else {
                        console.log("not ready yet")
                    }
                    // TEST DATA W/O IMAGE
                    // p.fill(123)
                    // p.rect(obj.position.x, obj.position.y, 64,64);
                } else {
                    // if resource not found
                    p.stroke(160);
                    p.rectMode(p.CENTER)
                    p.noFill();
                    p.beginShape();
                    obj.vertices.forEach(vertex => {
                        p.vertex(vertex.x, vertex.y);
                    })
                    p.endShape(p.CLOSE);
                }
            });
            p.pop();
        }
    }
    p.setup = function () {
        tileset_manager.setP5Instance(p);
        p.createCanvas(p.windowWidth - 20, p.windowHeight - 20);
        camera.width = p.windowWidth - 20;
        camera.height = p.windowHeight - 20;
        p.frameRate(60)
    };
    p.keyPressed = function () {
        if (p.keyCode === p.ENTER) {
            console.log(objectData);
        }
    }
    p.draw = function () {
        camera.update();
        p.background(0);
        p.translate(-camera.position.x + camera.width / 2, -camera.position.y + camera.height / 2)
        p.drawMap();
        p.drawMovingObjs();
    };
};
let p5_instance = new p5(sketch);
