const mongoose = require('mongoose');

const sch = {
    name:String,
    userid:String,
    email:String,
    number:Number,
    pass:String

}
const monmodel = mongoose.model("users",sch);
module.exports = monmodel;