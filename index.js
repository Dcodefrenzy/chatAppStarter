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
        sessions.findOne({$or: [ {starter:starter._id, to:to._id}, {starter:to._id, to:starter._id}]}).then((session)=>{
            
            if(!session) {
                const session = new sessions({starter:starter._id,to:to._id});
                session.save().then((session)=>{
                    socket.join(session._id);
                    console.log("new session", session)
                    socket.to(session._id).to(to.sessionId).emit("create room", starter, "someone wants to chat with you")
                }).catch((e)=>{
                    console.log(e)
                })
             }else if(session){
               console.log(session._id)
                socket.join(session._id);
                io.to(socket.id).emit("store room", session);
               socket.broadcast.to(session._id).emit("create room", starter, to,"wants to chat with you click here to join.")
            }
        }).catch(e=>{
            console.log(e);
        })
    })

    socket.on("join room", (starter, to)=>{
        sessions.findOne({$or: [ {starter:starter._id, to:to._id}, {starter:to._id, to:starter._id}]}).then((session)=>{
            if(!session) {
                    console.log("err")
             }else if(session){
                socket.join(session._id);
                console.log("join",session)
                io.to(socket.id).emit("store room", session);
               socket.to(session._id).to(to.sessionId).emit("join room", starter, to,"is online")
            }
        }).catch(e=>{
            console.log(e);
        })
    })

    socket.on("chat message", function(room, starter, message){
        sessions.findOne({_id:room}).then((session)=>{
                
            if(!session) {
                console.log("err")
            }else {
                io.to(session._id).emit("chat message",  starter, message)
            }
        }).catch(e=>{
            console.log(e);
        })
    })

    
  });

  http.listen(3000, function(){
    console.log('listening on *:3000');
  });
