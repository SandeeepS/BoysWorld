const {Schema,model} = require('mongoose');

module.exports.otp = model('otp', new Schema({
    number:{
        type:String,
        required:true
    },
    otp:{
        type:String,
        required:true
    },
    createdAt:{type:Date,default:Date.now,index:{expires:300}}//after 5 minutes it deleted automatically from the database
},{timestamps:true})) 