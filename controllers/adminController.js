const userModel = require('../models/userModel');
const adModel = require('../models/adminModel');
const productModel = require('../models/productModel');
const categoryModel = require('../models/categoryModel');



exports.adminlogin = async(req,res)=>{
    if(req.session.admin){
        res.redirect('/admin/dashboard');
    }else{
        res.render('adminpanel/login');
    }
}

exports.getHomePage = async(req,res)=>{
    res.render('adminpanel/index');
}

exports.getDashboard = async(req,res)=>{
    const {adname,adPassword} = req.body;
    console.log(adname);
    console.log(adPassword);

    try{
        const admin = await adModel.findOne({name:adname,pass:adPassword}).exec();
        console.log("admin found in the database :",admin);

        if(admin){
            req.session.admin = admin.name;
            console.log(req.session.admin);
            res.redirect('/admin/dashboard');
        }else{
            res.redirect('/admin');
        }
    }catch(error){
        console.error("error during login:",error);
        res.redirect('/');
    }
  
}

exports.getCustomer = async(req,res)=>{
    try{
        const usersData = await userModel.find().exec();
        res.render('adminpanel/customers',{users:usersData});
    }catch(error){
        console.error("error while fetching users",error);
    }
}


exports.getProduct = async(req,res)=>{
    try{
        const productData = await productModel.find().exec();
      
        res.render('adminpanel/product',{product:productData});
    }catch(error){
        console.error("error while fetching products",error);
    }
} 

exports.getCategories = async (req, res) => {
    try {
        const categoryData = await categoryModel.find().exec();
        if (!categoryData) {
              console.log("No categories found in the database.");
        } else {
            res.render('adminpanel/categories', { category: categoryData });
        }
    } catch (error) {
        console.error("Error while fetching categories", error);
    }
}

exports.getOrders = async(req,res)=>{
    res.render('adminpanel/orders');
}

exports.getBanner = async(req,res)=>{
    res.render('adminpanel/banner');
}





exports.addProduct = async(req,res)=>{
    res.render('adminpanel/addProduct');
}


//updateproduct page

exports.getUpdateProductPage = async(req,res)=>{
    try{
         const productId = req.params.id;
         console.log(productId);
         const  productToUpdate = await productModel.findById(productId).exec();  
          res.render('adminpanel/updateProduct',{productToUpdate});
    }catch(err){
        console.error("error in updation",err);
        res.redirect('/admin/products');
    }
}

//updatedproduct
exports.productUpdated = async(req,res)=>{
    try{
        const productId = req.params.id;
        const {productName,price,stock,discription} = req.body;
        await productModel.findByIdAndUpdate(productId,{productName,price,stock,discription}).exec();
        res.redirect('/admin/products');
    }catch(err){
        console.error("error updating product",err);
    }
}

//deleteproduct
exports.deleteProduct = async(req,res)=>{
    try{
        const productId = req.params.id;
        
        await productModel.findByIdAndDelete(productId).exec();
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
        console.log(categoryName);
        const newData = new categoryModel({categoryName});
        await newData.save();
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
        await categoryModel.findByIdAndDelete(catId).exec();
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
        const{productName,price,stock,image,discription} = req.body;
        const newData = new productModel({productName,price,stock,image,discription});
        await newData.save();
        console.log(`${productName} is inserted Successfully`);
        res.redirect('/admin/dashboard');

    }catch(err){
        console.error("error adding products :",err);
        res.render('/admin');
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

        res.json({ success: true, message: `User status updated to ${isBlocked ? "Blocked" : "Active"}` });

    } catch (err) {
        console.error("Error updating status:", err);
        res.redirect('/admin/customers');
    }
}







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
