const mongoose = require("mongoose");


const UsersShcema= mongoose.Schema({
    nickname:{
        type:String,
        require:true,
        unique:true,
    },
    createdAt:{
        type:Date,
        default:Date.now,
    },
    sessionId:{
        type:String,
    }
});

const users = mongoose.model("users", UsersShcema);
module.exports = users;