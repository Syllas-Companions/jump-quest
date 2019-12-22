var express = require('express');

var app = express();

app.use(express.static(__dirname + '/dist')); 
app.use("/maps",express.static(__dirname + '/maps'));

var server = require('http').Server(app);
var io = require('socket.io')(server);  

io.on('connection', function (socket) {
  socket.emit('hello');
//   socket.on('my other event', function (data) {
//     console.log(data);
//   }); 
}); 
 
console.log("Server is listenning on port "+(process.env.PORT || 3000))

server.listen(process.env.PORT || 3000);