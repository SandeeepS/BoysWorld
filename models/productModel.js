const mongoose = require('mongoose');

const sch = {
    productName:String,
    price:Number,
    stock:Number,
    image:[String],
    discription:String
}

const productModel = mongoose.model("products",sch);
module.exports = productModel;