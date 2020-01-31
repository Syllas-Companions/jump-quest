var express = require('express');
var path = require('path');

var app = express();

app.use("/",express.static('dist/public'));
app.use("/maps", express.static('resources/maps'));
// app.use("/tilesets", express.static('resources/tilesets'));
// app.use("/backgrounds", express.static('resources/backgrounds'));
 
var server = require('http').Server(app);
 
console.log("Server is listenning on port "+(process.env.PORT || 3000))

server.listen(process.env.PORT || 3000);