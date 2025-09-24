const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required :true
    },
    email:{
        type:String,
        required :true,
        unique:true
    },
    userName:{
        type:String,
        required :true,
        unique:true
    },
    password:{
        type:String,
        required :true,
    },
    role:{
        type:String,
        enum:['ADMIN','NORMAL'],
        default:'NORMAL'
    },
    profile:{
        type:String,
        default:"default.png"
    },
    passwordResetToken:{type:String},
    passwordResetExpires:{type:Date}
},{timestamps:true})

module.exports = mongoose.model('user',userSchema)