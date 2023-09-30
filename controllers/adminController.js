const userModel = require('../models/userModel');
const adModel = require('../models/adminModel');



exports.adminlogin = async(req,res)=>{
    res.render('adminpanel/login');
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
    res.render('adminpanel/customers');
}

exports.getProduct = async(req,res)=>{
    res.render('adminpanel/product');
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