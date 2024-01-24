const mongoose = require('mongoose');
const schema = {
    code:Number,
    listed:{
        type:Boolean,
        default:false
    },
    isDelete:{
        type:Boolean,
        default:false
    }
}

const coupenModel = mongoose.model("coupen",schema );
module.exports = coupenModel;