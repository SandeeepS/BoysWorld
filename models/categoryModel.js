const mongoose = require('mongoose');
const schema = {
    name:String,
    isDelete:{
        type:Boolean,
        default:false,
    }
   
}
const categoryModel = mongoose.model("categories",schema );
module.exports = categoryModel;