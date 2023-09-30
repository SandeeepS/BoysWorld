
const UserModel = require('../models/userModel');
const bcrypt = require("bcrypt");
const  lodash = require('lodash');
const axios = require('axios');
const otpGenerator = require('otp-generator');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: 'iamsandeep6969400@gmail.com',
    pass: 'newmailpass',
  },
});


const {user} = require('../models/userModel');
const {otp}  = require('../models/otp');

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


//sportsWear
exports.sportsWear = async(req,res)=>{
    res.render('sportswear');
}

exports.getOtpPage = async(req,res)=>{
    res.render('otp');
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

        const generatedOTP = otpGenerator.generate(6,{digits:true,upperCase:false,specialChars:false});
        const data = new UserModel({
            "name":req.body.username,
            "userid":req.body.userid,
            "email":req.body.email,
            "number":req.body.phonenumber,
            "pass":req.body.password,
            "otp":generatedOTP
        });
        const {name} = data;
        console.log(name);
        const savedData = await data.save();
         
        if(savedData){
            console.log("Record inserted successfully");
                 // Send OTP via email
                    const mailOptions = {
                        from: '2002m9002@.com',
                        to: req.body.email, // You can also use req.body.phonenumber here
                        subject: 'Your OTP Code',
                        text: `Your OTP code is: ${generatedOTP}`,
                    };
  
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                          console.error('Error sending OTP:', error);
                          res.redirect('/');
                        } else {
                          console.log('OTP email sent:', info.response);
                          res.redirect('/Otp'); // Redirect to the OTP verification page
                        }
                      });


        }else{
            console.log("failed to insert record");
            res.redirect("/");
        }
    }catch(error){
        console.error("Error during signup:",error);
        res.redirect("/");
    }
};


//varify otp

exports.verifyOTP = async (req, res) => {
    const { otpCode } = req.body;
  
    try {
      // Find the user by their email (or phone number if you saved it)
      const user = await UserModel.findOne({ email: req.body.email }).exec();
  
      if (user && user.otp === otpCode) {
        // OTP is correct; store user data or perform other actions here
        req.session.user = user.userid;
        console.log(req.session.user);
        res.redirect('/shop'); // Redirect to the shop page
      } else {
        // Invalid OTP
        console.log('Invalid OTP');
        res.redirect('/Otp'); // Redirect back to OTP page
      }
    } catch (error) {
      console.error('Error during OTP verification:', error);
      res.redirect('/Otp'); // Redirect back to OTP page on error
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


/****** get from navbar***********/


exports.getAccount = async(req,res)=>{
    res.render('accound');
}

exports.getWishlist = async(req,res)=>{
    res.render('wishlist');
}

exports.getCheckout = async(req,res)=>{
    res.render('checkout');
}

exports.getCart = async(req,res)=>{
    res.render('cart');
}

