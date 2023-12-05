const mongoose = require('mongoose');
const sch ={
    userId:String,
    productId:String,
    orderId:String,
    userName:String,
    productName:String,
    totalAmount:String,
    currentAddress:Object,
    date:Date,
    paymentMethod:String,
    currentStatus:String,
}

const orderModel = mongoose.model("orders",sch);
module.exports = orderModel;