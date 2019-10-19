const express = require("express");
const app = express();
const http = require('http').createServer(app)
const io = require("socket.io")(http);
const {mongoose} = require("./api/model/mongoose");
const users = require("./api/User/userModel");
const sessions = require("./api/sessions/sessionsModel");
app.use(express.static(__dirname + "/public"));



const chats = mongoose.Schema({
    from:{
        type:mongoose.Schema.Types.ObjectId,
        require:true,
    },
    to:{
        type:mongoose.Schema.Types.ObjectId,
        require:true,
    },
    message:{
        type:String,
        require:true,
    },
})
 
 




io.on('connection', function(socket){
    console.log("user conected")
    socket.on("register", function(username){
        const user  = new users({nickname:username, sessionId:socket.id});
        user.save().then((user)=>{
            io.to(user.sessionId).emit('register', user);
            io.emit("new user", user.nickname)
        }).catch((e)=>{
            io.to(user.sessionId).emit("user exist",e);
        });
    });

    socket.on("users", user=>{
        users.find().then((usersDoc)=>{
            users.findByIdAndUpdate(user, {$set: {sessionId:socket.id}}, {new: true}).then((user)=>{
                io.to(user.sessionId).emit("users", usersDoc);
            }).catch((e)=>{
                console.log(e)
            })
        }).catch((e)=>{
            console.log(e)
        });
    });

    socket.on("create room", (starter, to)=>{
        sessions.find({starter:starter, to:to}).then((session)=>{
            if(!session) {
                const session = new sessions({starter:starter,to:to});
                session.save().then((session)=>{
                    socket.join(session._id);
                    io.to(starter).emit("create room",to)
                }).catch((e)=>{
                    console.log(e)
                })
            }else{
                socket.join(session._id);
               
            }
        })
    })
    socket.on("typing", function(data){
        socket.broadcast.emit("typing", data);
    })
    
    socket.on("stop typing", function(data){
        socket.broadcast.emit("stop typing", "");
    })

    socket.on("chat message", function(data, id){
        console.log(usernames[id])
        io.to(usernames[id]).emit('chat message', data);
    })
  });

  http.listen(3000, function(){
    console.log('listening on *:3000');
  });