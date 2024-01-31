const productModel  = require('../../models/productModel');
const categoryModel = require('../../models/categoryModel');
const {default : mongoose} = require('mongoose');

//for getting the products 
exports.getProduct = async(req,res)=>{
    try{
        const page = req.query.page || 1;
        const currentPage = parseInt(page);
        console.log("current page:",currentPage);
        const itemsPerPage = 4;
        const skip = (page - 1) * itemsPerPage;
        const totalCount = await productModel.countDocuments({isDeleted:false}).exec();
        console.log("totalcount:",totalCount);
        const totalPages = Math.floor(totalCount/itemsPerPage);
        console.log("totalpages:",totalPages);
        const productData = await productModel
                 .find({isDeleted:false})
                 .skip(skip)
                 .limit(itemsPerPage)
                 .exec();
        const categoryData = await categoryModel.find({isDelete:false}).exec();
        const categoriesDict = {};
        categoryData.forEach((category) => {
        categoriesDict[category._id.toString()] = category.name;
        });
        res.render('adminpanel/product',{product:productData,categories:categoriesDict,totalPages,currentPage,totalCount});
    }catch(error){
        console.error("error while fetching products",error);
    }
} 


// to gettting add product  page
exports.addProduct = async(req,res)=>{
    try{
        const categoryData = await categoryModel.find({isDelete:false}).exec();
        res.render('adminpanel/addProduct',{category:categoryData});
    }catch(err){
        console.error("error loading catogories",err);
    }
}

//adding product
exports.addingProduct = async(req,res)=>{
    try{
        const{productName,price,small,medium,large,category,dis} = req.body;
        let offer = req.body.offer;
        if(offer == ""){
            offer = 0 ;
        }
        productImages =req.files.map((file)=>file.filename);

        let stockSmall,stockLarge,stockMedium;
        let croppedImage = req.files['croppedImage'];
        console.log("croppedImages :",croppedImage);        
        //setting the stock for small size
        if(small == ""){
            stockSmall = 0;
        }else{
            stockSmall = small;
        }

        //setting the stock for large size
        if(large == ""){
           stockLarge = 0;
        }else{
           stockLarge = large;
        }

        //setting the stock for medium size
        if(medium== ""){
            stockMedium = 0;
        }else{
            stockMedium = medium;
        }

        const  offerP = (offer/100)*price;
        const offerPrice = price - offerP;
        console.log("offerPrice:",offerPrice);

        const product = new productModel ({
              name:productName,
              price,
              stock:{
                sizeSmall:{
                    stock:stockSmall
                },
                
                sizeMedium:{
                    stock:stockMedium
                },

                sizeLarge:{
                    stock:stockLarge,
                },
              },
              image:productImages,
              discription: dis,
              isDeleted:false,
              category,
              offer,
              offerPrice
        })
        await product.save();
        console.log(`${productName} is inserted Successfully`);
        res.redirect('/admin/products');
    }catch(err){
        console.error("error adding products :",err);
        res.redirect('/admin/addingProduct');
    }
}

//updateproduct page
exports.getUpdateProductPage = async(req,res)=>{
    try{
         const productId = req.params.id;
         const productId2 = new mongoose.Types.ObjectId(productId);
         console.log("productId:",productId);
         const categoryData = await categoryModel.find({isDelete:false}).exec();
         const  productToUpdate = await productModel.aggregate([
               {
                   $match:{"_id":productId2}
               },
               {
                   $lookup:{
                        from:'categories',
                        localField:'category',
                        foreignField:'_id',
                        as:"catDetail"
                   }
               }
         ]).exec(); 
         console.log("productToUpdate:",productToUpdate);
         const currentCategory = productToUpdate[0].catDetail[0]._id;
         const category = await categoryModel.aggregate([
            {
                $match:{
                    "_id":{ $ne:currentCategory}
                }
            }
         ])
         console.log("currentCategorys:",category);
         console.log("poroduct:",productToUpdate);
          res.render('adminpanel/updateProduct',{productToUpdate,category});
    }catch(err){
        console.error("error in updation",err);
        res.redirect('/admin/products');
    }
}


//updatedproduct
exports.productUpdated = async(req,res)=>{
    try{
        const productId = req.params.id;
        const productId2 = new mongoose.Types.ObjectId(productId);
        let {productName,price,small,medium,large,discription,category,offer} = req.body;
        if(small == ""){
            small = 0;
        }
        if(medium == ""){
            medium = 0;
        }
        if(large == ""){
            large = 0;
        }
        console.log("category:",category);
        const existingProduct = await productModel.findById({"_id":productId2}).exec();
        console.log("existing product:",existingProduct);
        const productImages = req.files ? req.files.map((file) => file.filename) : [];
        const updatedImages = existingProduct.image.concat(productImages);
        console.log(productImages);
        console.log(updatedImages);
        await productModel.findByIdAndUpdate(
            {"_id":productId2},
            { 
                name: productName,
                price,
                stock:{
                    sizeSmall:{
                        stock:small
                    },
                    
                    sizeMedium:{
                        stock:medium
                    },

                    sizeLarge:{
                        stock:large
                    }
                },
                image:updatedImages,
                discription,
                category,
                offer
            }).exec();
        res.redirect('/admin/products');
    }catch(err){
        console.error("error updating product",err);
    }
}


//deleteproduct
exports.deleteProduct = async(req,res)=>{
    try{
        const productId = req.params.id;
        await productModel.findByIdAndUpdate(productId,{isDeleted:true}).exec();
        res.redirect('/admin/products');
    }catch(err){
        console.error("error deletting product",err);
        res.redirect('/admin/products');
    }
}

//deleting product images
exports.deleteProductImage = async (req, res) => {
    try {
        const productId = req.query.productId;
        console.log(productId);
        const imageName = req.query.imageName;
        console.log("image:",imageName);
        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        const imageIndex = product.image.findIndex(image => image ===imageName);
        console.log("imageindex:",imageIndex);
        if (imageIndex === -1) {
            return res.status(404).json({ message: 'Image not found for this product' });
        }
        product.image.splice(imageIndex, 1);
         await product.save();
        res.redirect('/admin/products')
    } catch (err) {
        console.error('Error while deleting the image', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};