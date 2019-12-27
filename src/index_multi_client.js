import io from 'socket.io-client'
import p5 from 'p5'
import {polynomial} from 'everpolate'


// console.log(polynomial([1,2,6,7],[3, 4],[4,5]))
var socket = io.connect();
socket.on('hello', function () {
    console.log("connected!");
    socket.emit('requestClientView');
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
socket.on('worldUpdate', function (data) {
    receivedStates.push({ timestamp: new Date().getTime()+100, data: data });
    //if (receivedStates.length > 3) receivedStates.shift();
});

let sketch = function (p) {
    p.setup = function () {
        p.createCanvas(p.windowWidth - 20, p.windowHeight - 20);
        p.frameRate(60)
    };
    p.keyPressed = function () {
        if (p.keyCode === p.ENTER) {
            console.log(receivedStates);
        }
    }
    p.draw = function () {
        p.background(0);
        p.stroke(160);
        p.noFill();
        let curTime = new Date().getTime();
        if (receivedStates.length > 0) {
            let currentState = receivedStates[0].data;
            currentState.forEach(objCurState => {
                // If there are at least 2 cached state then try to add frames to transit from the current state to the next one;
                if (receivedStates.length > 1) {
                    let id = objCurState.id;
                    let objNextState = receivedStates[1].data.find(val => val.id == id); // try to find the object with the same id (aka same object in next state)
                    if (objNextState) {
                        // draw frames in middle
                        p.beginShape();
                        for (let i = 0; i < objCurState.vertices.length; i++) {
                            // p.vertex(
                            //     p.map(curTime, receivedStates[0].timestamp, receivedStates[1].timestamp,objCurState.vertices[i].x,objNextState.vertices[i].x,true),
                            //     p.map(curTime, receivedStates[0].timestamp, receivedStates[1].timestamp,objCurState.vertices[i].y,objNextState.vertices[i].y,true)
                            // )
                            objCurState.vertices[i].x = p.lerp(objCurState.vertices[i].x, objNextState.vertices[i].x, 0.3);
                            objCurState.vertices[i].y = p.lerp(objCurState.vertices[i].y, objNextState.vertices[i].y, 0.3);
                            p.vertex(objCurState.vertices[i].x, objCurState.vertices[i].y);
                        }
                        p.endShape(p.CLOSE)
                    }
                    if(curTime>receivedStates[1].timestamp) receivedStates.shift();
                } 
                else 
                {
                    // draw the object in current state
                    p.beginShape();
                    objCurState.vertices.forEach(vertex => {
                        p.vertex(vertex.x, vertex.y);
                    })
                    p.endShape(p.CLOSE);
                }
            });
        }
    };
};
let p5_instance = new p5(sketch);
