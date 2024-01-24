const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productId:{
        type:mongoose.Schema.ObjectId,
    },
    quantity:Number,
    price:Number,
    total:Number,
    status:{
       type:Boolean,
       default:true,
    }
});

const orderShema ={
    userId:{
        type:mongoose.Schema.ObjectId,
    },
    products:[productSchema],
    orderId:Number,
    paymentId:{
        type:mongoose.Schema.ObjectId,
    },
    currentAddress:{
        type:mongoose.Schema.ObjectId,
    },
    totalAmount:Number,
    date:String,
    paymentMethod:String,
    currentStatus:String,
}
const orderModel = mongoose.model("orders",orderShema);
module.exports = orderModel;