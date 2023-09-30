const product = require('../models/productModel');

const add_product = async(req,res)=>{
    try{
        const arrimages = [];
        for(let i=0; i<req.files.length;i++){
            arrimages[i] = req.files[i].filename;
        }
        const product = new product({
            
        })
    }catch(error){
        res.status(400).send({success:false,msg:error.message});
    }
}
module.exports = {
    add_product
}