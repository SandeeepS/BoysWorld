const mongoose = require('mongoose');
const Sch = {
    categoryName:String,
    isDelete:{
        type:Boolean,
        default:false,
    }
   
}
const categoryModel = mongoose.model("categories",Sch);
module.exports = categoryModel;