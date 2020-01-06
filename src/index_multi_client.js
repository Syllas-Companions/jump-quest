import io from 'socket.io-client'
import p5 from 'p5'
import { polynomial } from 'everpolate'
import tileset_manager from 'tileset_manager'
import camera from 'camera'

// console.log(polynomial([1,2,6,7],[3, 4],[4,5]))
var socket = io.connect();
socket.on('hello', function () {
    console.log("connected!");
    socket.emit('requestClientView');
});

// tileset_manager.loadTileset('demo-tilesets');
// window.tileset_manager = tileset_manager;

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
socket.on('worldUpdate', function (data) {
    receivedStates.push({ timestamp: new Date().getTime() + 100, data: data });
    if (receivedStates.length > 3) receivedStates.shift();
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
            console.log(receivedStates);
        }
    }
    p.drawMovingObjs = function () {
        p.push();
        p.stroke(160);
        p.noFill();

        if (receivedStates.length > 0) {
            let currentState = receivedStates[0].data;
            currentState.forEach(objCurState => {
                // Assign target for camera = character of the current client
                if (socket.id == objCurState.client_id) {
                    camera.follow(objCurState);
                    window.camera = camera;
                }
                // If there are at least 2 cached state then try to add frames to transit from the current state to the next one;
                if (receivedStates.length > 1) {
                    let id = objCurState.id;
                    let objNextState = receivedStates[1].data.find(val => val.id == id); // try to find the object with the same id (aka same object in next state)
                    if (objNextState) {
                        // draw frames in middle
                        p.beginShape();
                        for (let i = 0; i < objCurState.vertices.length; i++) {
                            objCurState.vertices[i].x = p.lerp(objCurState.vertices[i].x, objNextState.vertices[i].x, 0.3);
                            objCurState.vertices[i].y = p.lerp(objCurState.vertices[i].y, objNextState.vertices[i].y, 0.3);
                            p.vertex(objCurState.vertices[i].x, objCurState.vertices[i].y);
                        }
                        p.endShape(p.CLOSE)
                    }
                    let curTime = new Date().getTime();
                    if (curTime > receivedStates[1].timestamp) receivedStates.shift();
                }
                else {
                    // draw the object in current state
                    p.beginShape();
                    objCurState.vertices.forEach(vertex => {
                        p.vertex(vertex.x, vertex.y);
                    })
                    p.endShape(p.CLOSE);
                }
            });
        }
        p.pop();
    }
    p.draw = function () {
        camera.update();
        p.background(0);
        p.translate(-camera.position.x+camera.width/2, -camera.position.y+camera.height/2)
        p.drawMap();
        p.drawMovingObjs();
    };
};
let p5_instance = new p5(sketch);
