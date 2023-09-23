const mongoose = require('mongoose');

const sch = {
    name:String,
    email:String
}
const monmodel = mongoose.model("users",sch);
module.exports = monmodel;