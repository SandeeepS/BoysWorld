const userModel = require('../models/userModel');


exports.adminPage = async(req,res)=>{
    res.render('adminpanel/login');
}

exports.getDashboard = async(req,res)=>{
    res.render('adminpanel/index');
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