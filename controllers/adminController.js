const userModel = require('../models/userModel');


exports.adminPage = async(req,res)=>{
    res.render('adminpanel/index');
}