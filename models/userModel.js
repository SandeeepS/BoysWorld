const mongoose = require('mongoose');

const sch = {
    name:String,
    email:String,
    number:Number,
    pass:String,
    otp:String,
    status:{
        type:Boolean,
        default:true
    },
    cart:[{}],
}
const monmodel = mongoose.model("users",sch);
module.exports = monmodel;