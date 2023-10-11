const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    productId:String,
    quantity:{
        type:Number,
        default:1
    },
    price:Number,
});

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
    cart:[cartItemSchema]
     
}
const monmodel = mongoose.model("users",sch);
module.exports = monmodel;