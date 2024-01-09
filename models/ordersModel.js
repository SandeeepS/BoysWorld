const mongoose = require('mongoose');
const sch ={
    userId:{
        type:mongoose.Schema.ObjectId,
    },
    products:[],
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
const orderModel = mongoose.model("orders",sch);
module.exports = orderModel;