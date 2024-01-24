const mongoose = require('mongoose');

const schema = {
    name:String,
    price:Number,
    stock:{
        sizeSmall:{
             stock:{
                type:Number
             }
        },

        sizeMedium:{
            stock:{
            type:Number
            },
        },

        sizeLarge:{
            stock:{
               type:Number
            }
        },
     
    },
    image:[String],
    discription:String,
    isDeleted:{
        type:Boolean,
        default:false,
    },
    category:{
        type:mongoose.Schema.ObjectId,
    },

}

const productModel = mongoose.model("products",schema);
module.exports = productModel;