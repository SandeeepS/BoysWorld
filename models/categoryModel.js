const mongoose = require('mongoose');
const Sch = {
    categoryName:String,
   
}
const categoryModel = mongoose.model("categories",Sch);
module.exports = categoryModel;