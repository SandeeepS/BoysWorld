const mongoose = require('mongoose');
const schema = {
    code:String,
    offer:Number,
    listed:{
        type:Boolean,
        default:false
    },
    isDelete:{
        type:Boolean,
        default:false
    }
}

const coupenModel = mongoose.model("coupens",schema );
module.exports = coupenModel;