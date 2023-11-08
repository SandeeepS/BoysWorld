



const UserModel = require('../models/userModel');

const otpGenerator = require('otp-generator');
const nodemailer = require('nodemailer');
const bcrypt  = require('bcrypt');
const moment =  require('moment');


const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: 'iamsandeep6969400@gmail.com',
    pass: 'newmailpass',
  },
});


const {user} = require('../models/userModel');
const {otp}  = require('../models/otp');
const categoryModel = require('../models/categoryModel');
const { default: mongoose } = require('mongoose');
const productModel = require('../models/productModel');
const { render } = require('../routes/userRoute');
const {ObjectId} = mongoose.Types;

exports.home = async(req,res)=>{
    res.render("index");

}

exports.loginPage = async(req,res)=>{
    const message = "Lets Go";
    res.render("login",{message});
}

exports.signupPage = async(req,res)=>{
    res.render('signup');
}

exports.shopPage = async(req,res)=>{
    try{
        const productData = await productModel.find({isDeleted:false}).exec();
        const categoryData = await categoryModel.find({isDelete:false}).exec();
      
        res.render('shop',{product:productData,category:categoryData});

     
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
    const message = "Enter OTP ";
    res.render('otp',{message});
}


exports.userEntry = async(req,res)=>{
    const {Email,Password} = req.body;
    console.log(Email);
    console.log(Password);

    try{
        const user = await UserModel.findOne({email:Email}).exec();
        if(user && user.status === true){
            const passwordMatch = await bcrypt.compare(Password,user.pass);
            if(passwordMatch){
                req.session.user = user._id;
                console.log( req.session.user);
                res.redirect('/shop');
            }else{
                const message = "incorrect email or password";
                res.render('login',{message});
            }
          
        }else{
            res.redirect('/login');
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
    const extime = moment().add(30,'seconds').toISOString();
    const saltRouds = 10;
    const hashedpassword = await bcrypt.hash(req.body.password,saltRouds);
    req.session.otpStorage = {
        otp,
        expirationTime: extime,
      };
   req.session.userData ={
    "username":req.body.username,
    "email":req.body.email,
    "phonenumber":req.body.phonenumber,
    "password":hashedpassword,
   }
   console.log(req.session.otpStorage);
  
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
        
        res.redirect('/getOtpPage');
      }
    });
    
    
    }catch(error){
        console.error("Error during signup:",error);
        res.redirect("/");
    }
};


//resendOTP
exports.resendOTP = async(req,res)=>{
    try{
        const otp = otpGenerator(4,{upperCase:false,specialChars:false});
        req.session.otpStorage = otp;
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
        to: '2002m9002@gmail.com', // Replace with the recipient's email
        subject: 'Resend OTP Verification',
        text: `Your new OTP is: ${otp}`,
      };
  
      // Send the email with the new OTP
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
          res.status(500).json({ message: 'Failed to resend OTP' });
        } else {
          console.log('Email sent:', info.response);
          res.status(200).json({ message: 'OTP resent successfully' });
        }
      });
    } catch (error) {
      console.error("Error resending OTP:", error);
      res.status(500).json({ message: 'Failed to resend OTP' });
    }
    
}


//varify otp

exports.verifyOtp = async (req, res) => {
 
  
    try {
    const {userotp} = req.body;
    const otpStorage = req.session.otpStorage.otp;
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
     req.session.user = req.session.userData.email;
    console.log(req.session.user);
    if(savedData){
        console.log("Record inserted successfully");
      
        res.redirect('/shop');
            


    }else{
        console.log("failed to insert record");
        res.redirect("/");
    }
    }else{
    console.log("incorrect otp");
    const message = "Invalid OTP";
    res.render('otp',{message});
    }
    }catch (error) {
      console.error('Error during OTP verification:', error);
      res.redirect('/Otp'); 
    }
  }

  //adding  cart
  exports.addToCart = async(req,res)=>{
    try{
      const productId = req.params.id;
      const userId = req.session.user

      console.log(productId);
      console.log(userId);

      const productData = await productModel.findById(productId,{isDeleted:false}).exec();

      if(!productData){
        return res.status(404).send("Product not found");
      }

      const productPrice = productData.price;   
      const user = await UserModel.findById(userId).exec();

      if(!user){
        return res.status(404).send("user not found");
      }
     
      const existingCartItem = user.cart.findIndex(
        (item) => item.productId === productId
      );

      if(existingCartItem ===-1){
        const newCartItem = {
          productId:productId,
          quantity:1,
          price:productPrice
        };
        user.cart.push(newCartItem);
        await user.save();
      }else{
        console.log("product already exist!!");
        res.redirect('/getCart')

      }

      const updateUser = await UserModel.findById(userId)
      .populate("cart.productId")
      .exec();
      
      const userWithCart = await UserModel.findById(userId);
      const productIdArray = [];
      productsInCart = userWithCart.cart;
      for(const pro of productsInCart){
           productIdArray.push(pro.productId);
      }

      const productIds = productIdArray;
      const products = await productModel.find({_id:{$in:productIds}}).exec();
      console.log(products);
      res.redirect('/getCart?products='+JSON.stringify(products));

    }catch(err){
        console.log("error while geting cart",err);
        res.status(500).send("internal server error");
    }
  }

//cartItemDelete
exports.cartItemDelete = async(req,res)=>{
  try{
    console.log("deleting");
    const productId  = req.params.id;
    const userId = req.session.user;
    console.log(userId);
    console.log(productId);
    const currentUser = await UserModel.findById(userId).exec();
    console.log(currentUser);

   
    if (currentUser) {
      // Find the index of the product with the given productId in the cart
      const productIndex = currentUser.cart.findIndex(product => product.productId.toString() === productId);

      if (productIndex !== -1) {
        // Remove the product from the cart array
        currentUser.cart.splice(productIndex, 1);

        // Save the updated user object
        await currentUser.save();

        // Render the cart with the updated products
        res.redirect('/getCart');
      }else{
        console.log("product not found in the cart");
      }
  
    }else{
      console.log("item not deleted");
      res.redirect('/getCart');
    }
    
        
  }catch(err){
   console.error("error while deleting the cart");
   res.redirect('/getCart');
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
  try{
       const user = req.session.user;
       const userData = await UserModel.findById(user).exec();
       console.log(userData);
       res.render('account',{userData});
  }catch(err){
    console.error("error while ")
  }
    
}

exports.getWishlist = async(req,res)=>{
    res.render('wishlist');
}



exports.getCheckoutPage = async(req,res)=>{
  try{
    const userId = req.session.user;
    const userData = await UserModel.findById(userId).exec();
 
    const address = userData.address;
    res.render('checkout',{address});
    

  }catch(err){
    console.error("error while getting checkout",err);
    res.redirect('/selectedProduct');
  }
  
}

exports.getCart = async(req,res)=>{
  try{
    const userId = req.session.user;
    const cartProductIds=[];
    const user = await UserModel.findById(userId).exec();
  for(let product of user.cart){
     cartProductIds.push(product.productId);
  }
  console.log(cartProductIds);
  const userData = user.cart;
  // const cartProducts = cartProductIds;
  const products = [];
  for (let productId of cartProductIds) {
    const product = await productModel.findById(productId).exec();
    if (product) {
      products.push(product);
    }
  }

  console.log(products);
 
  res.render('cart', { products ,userData}); 
  }catch(err){
    console.error("error while getting produts ",err);
    res.redirect('/shop');
  }

}

//updateQuantity
exports.updateQuantity = async (req, res) => {
  try {
    const { productId, newQuantity ,newTotal} = req.body;
    console.log(newTotal);
    const userId = req.session.user; // Assuming user is authenticated

    // Find the user and their cart
    const user = await UserModel.findById(userId).exec();
    
    // Check if the product exists in the user's cart
    const cartItem = user.cart.find((item) => item.productId === productId);
    console.log(cartItem.quantity);
    if (cartItem ) {
      // Update the quantity
      cartItem.quantity = newQuantity;
      cartItem.price = newTotal;

      // Save the updated user data
      await user.save();
    
      res.json({ newQuantity ,newTotal});
    }
     else {
      res.status(404).json({ error: "Product not found in the cart" });
    }
  } catch (err) {
    console.error("Error while updating the quantity:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


//add address
exports.addAddressPage = async(req,res)=>{
  try{
    res.render('addAddress');
  }catch(err){
    console.error("error while loading add Address page",err);
  }
}


//adresss
exports.address = async(req,res)=>{
  try{
      const user = req.session.user;
      // const userData = await UserModel.findById(user).exec();
      const address = {
        "formName": req.body.name,
        "formNumber":req.body.number,
        "formemail":req.body.email,
        "formhouseName":req.body.houseName,
        "formhouseNumber":req.body.houseNumber,
        "formstate":req.body.state,
        "formcity":req.body.city,
        "formstreet":req.body.street,
        "formlandmark":req.body.landmark,
        "formpin":req.body.pin,
      };
       const userData = await UserModel.findByIdAndUpdate(user,{
        $push:{
          address:{
            "name":address.formName,
            "number":address.formNumber,
            "email":address.formemail,
            "houseName":address.formhouseName,
            "houseNumber":address.houseNumber,
            "state":address.formstate,
            "city":address.formcity,
            "street":address.formlandmark,
            "landMark":address.formlandmark,
            "pin":address.formpin
          }
        }
       },{new:true});

       
       if(userData){
        console.log("Address inserted susscessfully");
        res.redirect('/getAccount');
       }else{
        console.log("record not inserted");
        res.redirect('/getAccount');
       }

    
  }catch(err){
    console.error("error while adding address",err);
  }
}


//show address page
exports.showAddress = async(req,res)=>{
  try{
    const userId = req.session.user;
    const userData = await UserModel.findById(userId).exec();
 
    const address = userData.address;
    console.log(address);
    res.render('showAddress',{address});

  }catch(err){
    console.error("error while getting show address page",err);
  }
}

//address delete

exports.addressDelete = async(req,res)=>{
  try{
    const userId = req.session.user;
    const addressId = req.params.id;
    const addressObjectId = new ObjectId(addressId).toString();
    console.log(addressObjectId);
    const user = await UserModel.findById(userId).exec();
  
    if(user){
      const addressIndex = user.address.findIndex((add) => add.id === addressObjectId);
      
      if(addressIndex !== -1){
        user.address.splice(addressIndex,1);
        await user.save();
        res.redirect('/showAddress');
      }else{
        console.log("address not found in the database");
      }
    }

  }catch(err){
    console.error("error while deleting the address",err);
  }
}