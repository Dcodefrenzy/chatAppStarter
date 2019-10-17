const express = require("express");
const app = express();
const http = require('http').createServer(app)
const io = require("socket.io")(http);
app.use(express.static(__dirname + "/public"));



io.on('connection', function(socket){
    socket.on("joined", function(data){

        io.emit("joined", data+" Just joined us.");
    })
    socket.on("typing", function(data){
        socket.broadcast.emit("typing", data);
    })
    
    socket.on("stop typing", function(data){
        socket.emit("stop typing", "");
    })
    socket.on("chat message", function(data){
        io.emit("chat message", data)
    })
  });

  http.listen(3000, function(){
    console.log('listening on *:3000');
  });