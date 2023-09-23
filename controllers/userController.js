const { log } = require('console');
const UserModel = require('../models/userModel');




exports.home = async(req,res)=>{
    res.render("index");

}

exports.loginPage = async(req,res)=>{
    res.render("login");
}

exports.signupPage = async(req,res)=>{
    res.render('signup');
}

exports.shopPage = async(req,res)=>{
    res.render('shop');
}

exports.contactPage = async(req,res)=>{
    res.render('contact');
}


exports.userEntry = async(req,res)=>{
    const {userName,userEmail} = req.body;
    console.log(userName);
    console.log(userEmail);

    try{
        const user = await UserModel.findOne({name:userName,email:userEmail}).exec();
        if(user){
            res.redirect('/shop');
        }else{
            red.redirect('/');
        }
    }catch(error){
        

        console.error("error during login",error);
        res.redirect('/');
    }
     
};


exports.signup = async(req,res)=>{
    try{
        const data = new UserModel({
            "name":req.body.username,
            "userid":req.body.userid,
            "email":req.body.email,
            "number":req.body.phonenumber,
            "pass":req.body.password
        });
        const {name} = data;
        console.log(name);
        const savedData = await data.save();
         
        if(savedData){
            console.log("Record inserted successfully");
            res.redirect("/shop");
        }else{
            console.log("failed to insert record");
            res.redirect("/");
        }
    }catch(error){
        console.error("Error during signup:",error);
        res.redirect("/");
    }
};