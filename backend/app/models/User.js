const mongoose = require('mongoose')

/* Creating a schema for the user model. */

const UserSchema = new mongoose.Schema({
    userName: {type: String,default:'', trim:true},
    userEmail:[{type:String, default:'',trim:true}],
    userPhone:[{type:String,default:'',trim:true, }],
    userPass:{type:String,required:true,trim:true,minlength:5,select:false},
    userAuthStatus:{type:String,enum:["active","inactive"],default:"inactive",trim:true},
    userType:{type:String,enum:["user","admin","moderator","superAdmin"],default:"user",trim:true}
},{timestamps:true})

module.exports = mongoose.model("User",UserSchema)