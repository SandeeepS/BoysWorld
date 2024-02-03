const mongoose = require('mongoose');
const schema = {
    offerType:String,
    code:String,
    offer:Number,
    minCartAmount:{
        type:Number,
        min:2000,
    },
    maxReedeemableAmount:{
        type:Number,
        max:5000,
    },
    expiryDate:String,
    listed:{
        type:Boolean,
        default:false,
    },
    isDelete:{
        type:Boolean,
        default:false,
    }
}

const coupenModel = mongoose.model("coupens",schema );
module.exports = coupenModel;