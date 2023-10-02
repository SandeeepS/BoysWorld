const mongoose = require('mongoose');
const caSch = {
    categoryName:String,
}
const categoryModel = mongoose.model("category",caSch);
module.exports = categoryModel;