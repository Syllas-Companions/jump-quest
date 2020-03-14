import room_manager from 'controllers/room_manager'
var express = require('express');
var path = require('path');
var app = express();

app.use("/",express.static('dist/public'));

app.use("/",express.static('resources'));
// app.use("/maps", express.static('resources/maps'));
// app.use("/tilesets", express.static('resources/tilesets'));
// app.use("/backgrounds", express.static('resources/backgrounds'));
// app.use("/fonts", express.static('resources/fonts'));

var server = require('http').Server(app);
 
// sockets.init(server);
room_manager.init(server);

console.log("Server is listenning on port " + (process.env.PORT || 3000))

server.listen(process.env.PORT || 3000);