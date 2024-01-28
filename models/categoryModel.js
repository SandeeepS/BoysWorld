const mongoose = require('mongoose');
const schema = {
    name:String,
    offer:{
        type:Number,
        min:0,
        max:100,
        default:0,
    },
    isDelete:{
        type:Boolean,
        default:false,
    }
   
}
const categoryModel = mongoose.model("categories",schema );
module.exports = categoryModel;