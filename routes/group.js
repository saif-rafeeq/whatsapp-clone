const mongoose = require("mongoose")

const groupSchema = mongoose.Schema({
     name:{
        type:String,
        unique:true
     },
     profileimg:{
        type:String,
      },
     users:[
        {
            type:mongoose.Schema.Types.ObjectId, 
            ref:"User"
        }
     ]
    
  },{
    timestamps: true
  })




  module.exports = mongoose.model("group",groupSchema)