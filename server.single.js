var express = require('express');

var app = express();

app.use(express.static(__dirname + '/dist')); 
app.use("/maps",express.static(__dirname + '/maps'));

var server = require('http').Server(app);
 
console.log("Server is listenning on port "+(process.env.PORT || 3000))

server.listen(process.env.PORT || 3000);