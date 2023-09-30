const mongoose = require('mongoose');

const sch = {
    name:String,
    email:String,
    pass:Number
}

const adModel = mongoose.model("admins",sch);
module.exports = adModel;