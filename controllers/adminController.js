const userModel = require('../models/userModel');
const adModel = require('../models/adminModel');
const productModel = require('../models/productModel');
const categoryModel = require('../models/categoryModel');
const orderModel = require('../models/ordersModel');
const { default: mongoose } = require('mongoose');






exports.adminlogin = async(req,res)=>{
    if(req.session.admin){
        res.redirect('/admin/dashboard');
    }else{
        const message = "Admin Login";
        res.render('adminpanel/login',{message});
    }
}

exports.getHomePage = async(req,res)=>{
    res.render('adminpanel/index');
}

exports.getDashboard = async(req,res)=>{
    const {email,adPassword} = req.body;
    console.log(email);
    console.log(adPassword);

    try{
        const admin = await adModel.findOne({email:email,pass:adPassword}).exec();
        console.log("admin found in the database :",admin);

        if(admin){
            req.session.admin = admin.name;
            console.log(req.session.admin);
            res.redirect('/admin/dashboard');
        }else{
            const message = "incorrect Password or Email";
            res.render('adminpanel/login',{message});
        }
    }catch(error){
        console.error("error during login:",error);
        res.redirect('/');
    }
  
}

exports.getCustomer = async(req,res)=>{
    try{
        const page = req.query.page || 1;
        const currentPage = parseInt(page);
        console.log("current page:",currentPage);
        const itemsPerPage = 5;
        const skip = (page - 1) * itemsPerPage;
        const totalCount = await userModel.countDocuments({isDeleted:false}).exec();
        console.log("totalcount:",totalCount);
        const totalPages = Math.floor(totalCount/itemsPerPage);
        console.log("totalpages:",totalPages);
        const usersData = await userModel
                    .find({status:true})
                    .skip(skip)
                    .limit(itemsPerPage)
                    .exec();
        res.render('adminpanel/customers',{users:usersData,totalPages,currentPage,totalCount});
    }catch(error){
        console.error("error while fetching users",error);
    }
}


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
              categoriesDict[category._id.toString()] = category.categoryName;
        });
        res.render('adminpanel/product',{product:productData,categories:categoriesDict,totalPages,currentPage,totalCount});

     
    }catch(error){
        console.error("error while fetching products",error);
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
         res.status(200).json({ message: 'Image deleted successfully' });
    } catch (err) {
        console.error('Error while deleting the image', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};


exports.getCategories = async (req, res) => {
    try {
        const page = req.query.page || 1;
        const currentPage = parseInt(page);
        console.log("current page:",currentPage);
        const itemsPerPage = 5;
        const skip = (page - 1) * itemsPerPage;
        const totalCount = await productModel.countDocuments({isDeleted:false}).exec();
        console.log("totalcount:",totalCount);
        const totalPages = Math.floor(totalCount/itemsPerPage);
        console.log("totalpages:",totalPages);
        const categoryData = await categoryModel
                  .find({isDelete:false})
                  .skip(skip)
                  .limit(itemsPerPage)
                  .exec();
        console.log(categoryData);
        if (!categoryData) {
              console.log("No categories found in the database.");
        } else {
            res.render('adminpanel/categories', { category: categoryData,totalPages,currentPage,totalCount });
        }
    } catch (error) {
        console.error("Error while fetching categories", error);
    }
}

exports.getOrders = async(req,res)=>{
    try{
        const  orderStatus = ["Shipped","Out for Delivery","Deliverd"];
        const page = req.query.page || 1;
        const currentPage = parseInt(page);
        console.log("current page:",currentPage);
        const itemsPerPage = 8;
        const skip = (page - 1) * itemsPerPage;
        const totalCount = await orderModel.countDocuments({isDeleted:false}).exec();
        console.log("totalcount:",totalCount);
        const totalPages = Math.floor(totalCount/itemsPerPage);
        console.log("totalpages:",totalPages);
        const products = await productModel.find().exec();
        const oders = await orderModel.aggregate([
            {
                $lookup:{
                    from:'users',
                    localField: 'userId',
                    foreignField:'_id',
                    as:"userDetails"
                }
            },
            {
                $skip:skip
            },
            {
                $limit:itemsPerPage
            },
            {
                $sort:{
                    date:-1
                }
            }
        ]).exec();

      
        res.render('adminpanel/orders',{oders,products,orderStatus,totalPages,currentPage,totalCount});
    }catch(err){
        console.error("error while getting the orders list  page",err);
    }
  
}

exports.getBanner = async(req,res)=>{
    res.render('adminpanel/banner');
}





exports.addProduct = async(req,res)=>{
    try{
        const categoryData = await categoryModel.find({isDelete:false}).exec();
        res.render('adminpanel/addProduct',{category:categoryData});
    }catch(err){
        console.error("error loading catogories",err);
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
         console.log("poroduct:",productToUpdate);
          res.render('adminpanel/updateProduct',{productToUpdate,category:categoryData});
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
        const {productName,price,stock,discription,category} = req.body;
        console.log("category:",category);
        const existingProduct = await productModel.findById({"_id":productId2}).exec();
        console.log("existing product:",existingProduct);
        const productImages = req.files ? req.files.map((file) => file.filename) : [];
        const updatedImages = existingProduct.image.concat(productImages);
        console.log(productImages);
        console.log(updatedImages);
        await productModel.findByIdAndUpdate({"_id":productId2},{productName,price,stock,image:updatedImages,discription,category}).exec();
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

exports.addcategoryPage = async(req,res)=>{
    res.render('adminpanel/addCategory');
}

//adding category
exports.addingCategory = async(req,res)=>{
    try{
        const {categoryName} = req.body;
        console.log("catyer",categoryName);
        const lowercaseCategoryName = typeof categoryName === 'string' ? categoryName.toLowerCase() : categoryName;
        const existingCategory = await categoryModel.findOne({ "categoryName": { $regex: new RegExp('^' + lowercaseCategoryName + '$', 'i') }})
        console.log("existing category",existingCategory);
       if(existingCategory){
           await categoryModel.updateOne({"categoryName":{ $regex: new RegExp('^' + lowercaseCategoryName + '$', 'i') }},{$set:{"isDelete":false}});
           console.log("category already exists .updated existing category");
       }else{
         const newCategory = new categoryModel({
           "categoryName":categoryName,
            "isDelete":false
         });
         await newCategory.save();
         console.log("category added successfully");
       }
        res.redirect('/admin/categories');
    }catch(err){
        console.error("error while creating categories",err);
        res.redirect('/admin/categories');
    }
}
//deleting categories
exports.deleteCategory = async(req,res)=>{
    try{
        const catId = req.params.id;
        await categoryModel.findByIdAndUpdate(catId,{isDelete:true}).exec();
        res.redirect('/admin/categories');
    }catch(err){
        console.error("error while deleting the category",err);
        res.redirect('/admin/categories');
    }
}


//updateCategoryPage
exports.getUpdateCategoryPage = async(req,res)=>{
    try{
        const catId = req.params.id;
        const cataToUpdate = await categoryModel.findById(catId).exec();
        res.render('adminpanel/updatecategory',{cataToUpdate});
    }catch(err){
        console.error("error while updating catogery",err)
            res.redirect('/admin/catogeries');
        
    }
}

//updating category
exports.updateCategory = async(req,res)=>{
    try{
        const catId = req.params.id;
        const {categoryName} = req.body;
        await categoryModel.findByIdAndUpdate(catId,{categoryName}).exec();
        res.redirect('/admin/categories')
    }catch(err){
        console.error("error while updating the category",err);
        res.redirect('/admin/categories');
    }
}

//adding product
exports.addingProduct = async(req,res)=>{
    try{
        const{productName,price,stock,image,discription,category} = req.body;
        const productImages = req.files.map((file)=>file.filename);
        
        console.log(productImages);
        const newData = new productModel({productName,price,stock,image:productImages,discription,category});
        await newData.save();
        console.log(`${productName} is inserted Successfully`);
        res.redirect('/admin/products');

    }catch(err){
        console.error("error adding products :",err);
        res.redirect('/admin/addingProduct');
    }
}

//updateStatus

exports.updateStatus = async (req, res) => {
    try {
        const { userId, isBlocked } = req.body;

        
        const user = await userModel.findById(userId).exec();
       console.log(user.name);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        console.log(user.name);
        
        user.status = isBlocked;
        await user.save(); 
         // Invalidate the user's session
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
                res.status(500).send('Internal Server Error');
            }
            else 
            {
            res.json({ success: true, message: `User status updated to ${isBlocked ? "Blocked" : "Active"}` });
            }
        });
       
    } catch (err) {
        console.error("Error updating status:", err);
        res.redirect('/admin/customers');
    }
}


exports.updateOrderStatus = async (req, res) => {
    try {
        const { newStatus, orderId } = req.body;
        const userId = req.session.user;
    
         const orderToUpdate = await orderModel.updateOne({_id:orderId},{$set:{"currentStatus":newStatus}}).exec();
        res.status(200).json({success:true,message:"status updated succesfully",newStatus,orderId});
       

    } catch (err) {
        console.error("Error while updating the status on the server side ", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};




//logout
exports.logout = async(req,res)=>{
    req.session.destroy((err)=>{
        if(err){
            console.error("Error destroying session",err);
        }else{
            res.redirect('/admin');
        }
    });
}
