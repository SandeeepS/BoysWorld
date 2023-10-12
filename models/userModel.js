const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    productId:String,
    quantity:{
        type:Number,
        default:1
    },
    price:Number,
});

const addressSchema = new mongoose.Schema({
    name:String,
    number:String,
    email:String,
    houseName:String,
    houseNumber:Number,
    state:String,
    city:String,
    street:String,
    landMark:String,
})

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
    cart:[cartItemSchema],
    address:[addressSchema]
     
}
const monmodel = mongoose.model("users",sch);
module.exports = monmodel;