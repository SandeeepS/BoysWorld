const mongoose = require('mongoose');
const sch ={
    userId:{
        type:mongoose.Schema.ObjectId,
    },
    productId:{
        type:mongoose.Schema.ObjectId,
    },
    orderId:String,
    userName:String,
    productName:String,
    totalAmount:String,
    currentAddress:Object,
    date:String,
    paymentMethod:String,
    currentStatus:String,
    
}

const orderModel = mongoose.model("orders",sch);
module.exports = orderModel;