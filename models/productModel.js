const mongoose = require('mongoose');

const sch = {
    productName:String,
    price:Number,
    stock:{
        sizeSmall:{
             stock:{
                type:Number
             }
        },

        sizeLarge:{
            stock:{
               type:Number
            }
        },

        sizeMedium:{
            stock:{
            type:Number
            },
        },

        sizeExtraLarge:{
            stock:{
               type:Number
            }
        },

       sizeDoubleExtraLarge:{
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

const productModel = mongoose.model("products",sch);
module.exports = productModel;