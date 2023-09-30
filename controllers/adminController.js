const userModel = require('../models/userModel');
const adModel = require('../models/adminModel');
const productModel = require('../models/productModel');



exports.adminlogin = async(req,res)=>{
    if(req.session.admin){
        res.redirect('admin/dashboard');
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

exports.getCategories = async(req,res)=>{
    res.render('adminpanel/categories');
}
exports.getOrders = async(req,res)=>{
    res.render('adminpanel/orders');
}

exports.getBanner = async(req,res)=>{
    res.render('adminpanel/banner');
}



exports.logout = async(req,res)=>{
    req.session.destroy((err)=>{
        if(err){
            console.error("Error destroying session",err);
        }else{
            res.redirect('/admin');
        }
    });
}

exports.addProduct = async(req,res)=>{
    res.render('adminpanel/addProduct');
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


