const mongoose = require("mongoose");

const SessionSchema = mongoose.Schema({
    starter:{
        type:mongoose.Schema.Types.ObjectId,
        require:true,
    },
    to:{
        type:mongoose.Schema.Types.ObjectId,
        require:true,
    },

    active:{
        type:Boolean,
        default: true,
    },
})

const session = mongoose.model("session", SessionSchema);
module.exports = session;