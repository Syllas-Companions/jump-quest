import io from 'socket.io-client'
import dataPrepare from './dataPrepare'
import display from './display'

var socket = io.connect();
var clientState = {
    isAlive: true,
    id: null,
    latency: 100,
    hp: 0,
    sendingInput: true,
    mapData: null,
    dynamicData: null
}

//input to move character
clientState.keyState = {}
window.addEventListener('keydown', function (e) {
    clientState.keyState[e.keyCode || e.which] = true;
}, true);
window.addEventListener('keyup', function (e) {
    clientState.keyState[e.keyCode || e.which] = false;
}, true);

dataPrepare(socket, clientState);
display(socket, clientState)
