
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
    const {Userid,Password} = req.body;
    console.log(Userid);
    console.log(Password);

    try{
        const user = await UserModel.findOne({userid:Userid,pass:Password}).exec();
        if(user){
            req.session.user = user.userid;
            console.log( req.session.user);
            res.redirect('/shop');
        }else{
            res.redirect('/');
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

exports.logout = (req,res)=>{
    req.session.destroy((err)=>{
        if(err){
            console.error("Error distroying session",err);
        }else{
            res.redirect('/');
        }
    });
}