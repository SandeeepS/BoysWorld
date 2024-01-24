const mongoose = require('mongoose');

const schema = {
    name:String,
    email:String,
    pass:Number
}

const adModel = mongoose.model("admins",schema);
module.exports = adModel;