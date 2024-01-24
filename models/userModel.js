const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    productId:{
        type:mongoose.Schema.ObjectId,
    },
    quantity:Number,
    size:String,
    price:Number,
    total:Number
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
    pin:Number,
})



const shcema = {
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
    address:[addressSchema],
    currentAddress:{
        type:mongoose.Schema.ObjectId
    },
    wallet:{
        type:Number,
        default:0
    }
    
     
}
const monmodel = mongoose.model("users", shcema);
module.exports = monmodel;