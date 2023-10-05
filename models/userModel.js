const mongoose = require('mongoose');

const sch = {
    name:String,
    userid:String,
    email:String,
    number:Number,
    pass:String,
    otp:String,
    status:{
        type:Boolean,
        default:true
    }
}
const monmodel = mongoose.model("users",sch);
module.exports = monmodel;