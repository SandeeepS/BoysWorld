const mongoose = require('mongoose');

const sch = {
    productName:String,
    price:Number,
    stock:Number,
    image:[String],
    discription:String,
    isDeleted:{
        type:Boolean,
        default:false,
    },
    category:{
        type:mongoose.Schema.ObjectId,
    },

}

const productModel = mongoose.model("products",sch);
module.exports = productModel;