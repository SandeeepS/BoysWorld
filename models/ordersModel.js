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

const orderSchema ={
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
    usedCoupen:String
}
const orderModel = mongoose.model("orders",orderSchema);
module.exports = orderModel;