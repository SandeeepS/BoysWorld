
const UserModel = require('../models/userModel');
const productModel = require('../models/productModel');
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
    try{
        const productData = await productModel.find({isDeleted:false}).exec();
        // productData.forEach((pro)=>{
        //     console.log(pro.image);
        // })
        
        res.render('shop',{product:productData});

     
    }catch(error){
        console.error("error while fetching products",error);
        res.redirect('/');
    }
   
}

//selected product

exports.selectedProduct = async(req,res)=>{
    try{
        const prodId = req.params.id;
        const productData = await productModel.findById(prodId,{isDeleted:false}).exec();
        // productData.forEach((pro)=>{
        //     console.log(pro.image);
        // })
        
        res.render('selectedProduct',{productData});

     
    }catch(error){
        console.error("error while fetching products",error);
        res.redirect('/shop');
    }
   
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
        if(user && user.status === true){
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

          
    // Generate a random OTP
    const otp = otpGenerator.generate(4, { upperCase: false, specialChars: false });
   req.session.otpStorage = otp;
   req.session.userData ={
    "username":req.body.username,
    "userid":req.body.userid,
    "email":req.body.email,
    "phonenumber":req.body.phonenumber,
    "password":req.body.password,
   }
 
    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'iamsandeep6969400@gmail.com',
        pass: 'ijpzysobzeshejlv',
      },
    });
    
    // Email configuration
    const mailOptions = {
      from: 'sandeeps@gmail.com',
      to: '2002m9002@gmail.com',
      subject: 'OTP Verification',
      text: `Your OTP is: ${otp}`,
    };
    
    // Send the email with OTP
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        res.redirect('/');
      } else {
        console.log('Email sent:', info.response);
        
        res.render('otp');
      }
    });
    
    
    }catch(error){
        console.error("Error during signup:",error);
        res.redirect("/");
    }
};


//varify otp

exports.verifyOtp = async (req, res) => {
 
  
    try {
    const {userotp} = req.body;
    const otpStorage = req.session.otpStorage;
    const userData = req.session.userData;

   
    console.log(userData);
    console.log(otpStorage);
    if(userotp === otpStorage){
      const data = new UserModel({
        "name":userData.username,
        "userid":userData.userid,
        "email":userData.email,
        "number":userData.phonenumber,
        "pass":userData.password,
        
    });
    const {name} = data;
    console.log(name);
    const savedData = await data.save();
     
    if(savedData){
        console.log("Record inserted successfully");
        res.redirect('/shop'); // Redirect to the OTP verification page
            


    }else{
        console.log("failed to insert record");
        res.redirect("/");
    }
    }else{
    console.log("incorrect otp");
    res.redirect('/signup');
    }
    }catch (error) {
      console.error('Error during OTP verification:', error);
      res.redirect('/Otp'); // Redirect back to OTP page on error
    }
  }

  




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

