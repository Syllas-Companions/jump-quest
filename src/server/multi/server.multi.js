import sockets from './server.multi.socket';
import room_manager from 'room_manager'
var express = require('express');
var path = require('path');
var app = express();

app.use("/",express.static('dist/public'));
app.use("/maps", express.static('maps'));
app.use("/tilesets", express.static('tilesets'));

var server = require('http').Server(app);
 
// sockets.init(server);
room_manager.init(server);

console.log("Server is listenning on port " + (process.env.PORT || 3000))

server.listen(process.env.PORT || 3000);