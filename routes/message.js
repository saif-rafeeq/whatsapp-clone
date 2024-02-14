const mongoose = require("mongoose")
const msgSchema = mongoose.Schema({
    msg: {
      type:String,
      required:[true,  "msg is required"]
    },
    sender:String,   
    reciver:String,
    
  },{
    timestamps: true
  })

  module.exports = mongoose.model("message",msgSchema)