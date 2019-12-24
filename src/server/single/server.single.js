var express = require('express');
var path = require('path');

var app = express();

app.use("/",express.static('dist/public'));
app.use("/maps", express.static('maps'));
 
var server = require('http').Server(app);
 
console.log("Server is listenning on port "+(process.env.PORT || 3000))

server.listen(process.env.PORT || 3000);