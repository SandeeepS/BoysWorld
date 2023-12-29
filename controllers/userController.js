



const UserModel = require('../models/userModel');
const orderModel = require('../models/ordersModel');

const otpGenerator = require('otp-generator');
const nodemailer = require('nodemailer');
const bcrypt  = require('bcrypt');
const moment =  require('moment');
const Razorpay = require('razorpay');
const { v4: uuidv4 } = require('uuid');
const { format } = require('date-fns');

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

const { log } = require('console');
const crypto = require('crypto');
const { name } = require('ejs');
const {RAZORPAY_ID_KEY,RAZORPAY_SECRET_KEY} = process.env;

var instance = new Razorpay({
  key_id: RAZORPAY_ID_KEY,
  key_secret: RAZORPAY_SECRET_KEY,
});

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
        const user = req.session.user;
        const userId = new mongoose.Types.ObjectId(user);
        const productData = await productModel.find({isDeleted:false}).exec();
        const categoryData = await categoryModel.find({isDelete:false}).exec();
        const Currentuser = await UserModel.findOne({"_id":userId})
        console.log("currentUser:",Currentuser);
        res.render('shop',{product:productData,category:categoryData,Currentuser});

     
    }catch(error){
        console.error("error while fetching products",error);
        res.redirect('/');
    }
   
}

//get product by category
exports.categoryBasedProduct = async(req,res)=>{
  try{
    const {categoryId } = req.body;
    const  newCategoryId = new mongoose.Types.ObjectId(categoryId);
    console.log("category id",newCategoryId);
    const categoryData = await categoryModel.find({isDelete:false}).exec();
    const productData = await productModel.aggregate([
           {
            $match:{
              $and:[
                {isDeleted:false},
                {category:newCategoryId}
              ]
            },
           }
    ]).exec();

    console.log("products:",productData);
    res.status(200).json({success:true,product:productData,category:categoryData});



  }catch(err){
    console.error("error getting the product in the category",err);
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


//resendOTP when signUp
exports.resendOTP = async(req,res)=>{
    try{
      const extime = moment().add(30,'seconds').toISOString();

      const otp = otpGenerator.generate(4, { upperCase: false, specialChars: false });
      req.session.otpStorage = {
        otp,
        expirationTime: extime,
      };
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
          const message = "otp resended ";
          res.render('otp',{message});
        }
      });
    } catch (error) {
      console.error("Error resending OTP:", error);
      res.status(500).json({ message: 'error!!!!' });
    }
    
}

//resent otp for resetPassword in login
exports.reSendotpResetPassword = async(req,res)=>{
  try{ 
    console.log("hello");
    const extime = moment().add(30,'seconds').toISOString();

    const otp = otpGenerator.generate(4, { upperCase: false, specialChars: false });
    req.session.otpStorage = {
      otp,
      extime,
    };
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
        const message = "otp resended ";
       
        res.send(200,{success:true,message})
      }
    });

  }catch(err){
    console.error("error in resending the otp while login",err);
  }
}


//varify otp for signup
exports.verifyOtp = async (req, res) => {
 
  
    try {
    const {userotp} = req.body;
    const otpStorage = req.session.otpStorage.otp;
    const currentTimeStamp = moment();
    const exTime = req.session.otpStorage.expirationTime;
    const exTimeMoment = moment(exTime);
    const userData = req.session.userData;

   
   console.log(currentTimeStamp);
   console.log(exTime);
    if(userotp === otpStorage){
      const data = new UserModel({
        "name":userData.username,
        "userid":userData.userid,
        "email":userData.email,
        "number":userData.phonenumber,
        "pass":userData.password,
        
    });
    if(currentTimeStamp.isBefore(exTimeMoment)){

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
  }else{
        console.log("time is expired ");
        const message = "time over";
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
      const productId2 =new mongoose.Types.ObjectId(productId);
      console.log(productId2);
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
          productId:productId2,
          quantity:1,
          price:productPrice,
          total:productPrice
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
       const userId = req.session.user;
       const userData = await UserModel.findById(userId).exec();
       const orders = await orderModel.find({userId:userId}).exec();
       console.log(orders);
       res.render('account',{orders,userData});
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
      const currentAddress = userData.currentAddress;
      const productId = req.query.productId;
      console.log("productId:",productId);
      const productId2 = new mongoose.Types.ObjectId(productId);
      const quantity = req.query.quantity;
      const product2 = await productModel.findById(productId).exec();
      console.log("product2",product2);
      const totalPrice = product2.price * quantity;
      const product = await productModel.aggregate([
        {
          $match:{
            '_id':productId2
          }
        }
      ])
      console.log("productdetails:", product);
      res.render('checkout',{address,currentAddress, product,quantity,totalPrice});

  }catch(err){
    console.error("error while getting checkout",err);
    res.redirect('/selectedProduct');
  }
  
}
//from cart
exports.getCheckoutPage2 = async(req,res)=>{
  try{
    console.log("kjgjgfgjd");
    const {cart,totalAmount} = req.query;
    const userId = req.session.user;
    console.log(userId);
    const userData = await UserModel.findById(userId).exec();
    const userIdObj =  userData._id;
    const address = userData.address;
    const currentAddress = userData.currentAddress;
    const cartDetails = await UserModel.aggregate([
        {
          $match:{_id:userIdObj}
        },
        {
         $unwind:"$cart"
        },
        {
          $lookup:{
            from:'products',
            localField:'cart.productId',
            foreignField:'_id',
            as:"productDetail"
          }
        }
    ]).exec();
    console.log("cartdetails:",cartDetails)
    console.log("pro:",cartDetails[0].productDetail[0]);
    res.render('checkout2',{address,currentAddress,cartDetails,totalAmount});

  }catch(err){
      console.log("error in getcheckout2 ",err);
  }
}



exports.getCart = async(req,res)=>{
  try{
       const userId = req.session.user;
       const userId2 = new mongoose.Types.ObjectId(userId);
       console.log("userid:",userId2);
       let cartTotal = 0;
       const cart = await UserModel.aggregate([
        {
          $match:{_id:userId2}
        },
        {
          $unwind:'$cart'
        },
        {
          $lookup:{
            from:'products',
            localField:'cart.productId',
            foreignField:'_id',
            as:"product"
          }
        }
       ]);
       
       for(let i = 0; i < cart.length; i++){
           cartTotal = cartTotal + cart[i].cart.total;
       }
      console.log("total:",cartTotal);
      
      console.log("cart:",cart);
      console.log("firstproduct:",cart[0].product);
      
  res.render('cart', {cart,cartTotal}); 
  }catch(err){
    console.error("error while getting produts ",err);
    res.redirect('/shop');
  }

}



//updateQuantity
exports.updateQuantity = async (req, res) => {
  try {
    const { productId, newQuantity ,currentQuantity,singleUnitPrice} = req.body;
    console.log("singleproductprice",singleUnitPrice);
    const newTotal = newQuantity*singleUnitPrice;
    console.log("newtotal:",newTotal);
    const newProductId = new mongoose.Types.ObjectId(productId);
    console.log("productId",newProductId);
    let cartTotal = 0;
    const userId = req.session.user; 
    const userId2 = new mongoose.Types.ObjectId(userId);
    const cartItem = await UserModel.findOneAndUpdate(
      {"_id":userId2,"cart.productId":newProductId},
      {$set:{"cart.$.quantity":newQuantity,"cart.$.total":newTotal}},
      {new: true}
    );
    console.log("cartItem:",cartItem);
    for(let i = 0; i < cartItem.cart.length; i++){
          cartTotal = cartTotal+cartItem.cart[i].total;
    }
    
    res.json({ newQuantity ,newTotal,cartTotal});
   
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


//save userAddress
exports.saveAddress = async(req,res)=>{
  try{
    const user = req.session.user;
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
      $set:{
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
      console.log("Address saved susscessfully");
      res.redirect('/getAccount');
     }else{
      console.log("record not inserted");
      res.redirect('/getAccount');
     }


  }catch(err){
    console.log("error in saving address",err);
  }
}

//show address page
exports.showAddress = async(req,res)=>{
  try{
    const userId = req.session.user;
    const userData = await UserModel.findById(userId).exec();
 
    const address = userData.address;
    const currentAddress = userData.currentAddress;
    console.log(address);
    res.render('showAddress',{address,currentAddress});

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


exports.setDefaultAddress = async (req, res) => {
  try {
    const userId = req.session.user;
    const addressId = req.params.id;
    const addressObjectId = new ObjectId(addressId).toString();
    const user = await UserModel.findById(userId).exec();

    if (user) {
      let currentAddressIndex = user.address.findIndex((add) => add.id === addressObjectId);
      console.log(currentAddressIndex);
      if (currentAddressIndex !== -1) { // Check if the index is valid
        console.log("helooooooooo");

        const currentAddress = user.address[currentAddressIndex]; // Fetch the current address from user.address
        user.currentAddress.splice(0, 1, currentAddress); // Replace the existing current address with the new one
        await user.save();
      } else {
        console.log("Address not found.");
      }
    }

    res.redirect('/showAddress');
  } catch (err) {
    console.error("Error while updating the default address", err);
    res.redirect('/showAddress');
  }
}

//setaddressFrom checkout

exports.setDefaultAddressFromCheckouts = async (req, res) => {
  try {
    const userId = req.session.user;
    const addressId = req.params.id;
    const productId = req.params.id;
    const quantity = req.params.id;
    console.log(productId,quantity);
    const addressObjectId = new ObjectId(addressId).toString();
        const user = await UserModel.findById(userId).exec();
   
    if (user) {
      let currentAddressIndex = user.address.findIndex((add) => add.id === addressObjectId);
      console.log(currentAddressIndex);
      if (currentAddressIndex !== -1) { 
        const currentAddress = user.address[currentAddressIndex]; 
        user.currentAddress.splice(0, 1, currentAddress);
        await user.save();
        console.log("address saved successfuly");
      } else {
        console.log("Address not found.");
      }
    }


    res.redirect('/getCheckout2',productId,quantity);
  } catch (err) {
    console.error("Error while updating the default address", err);
    res.redirect('/getCheckout');
  }
}


//place order 

//place order 
exports.placeOrder = async (req, res) => {
  try {
    const { cartDetail,totalAmount} = req.body;
    console.log(cartDetail);



    for(let i=0;i<cartDetail.length;i++){
      const cashOnDelivery = "cashOnDelivery";
      const status = "Conformed";
      const userId = cartDetail[i]._id;
      const productId = cartDetail[i].productDetail[0]._id;
      const productName = cartDetail[i].productDetail[0].productName;
      const userName = cartDetail[i].name;
      const date = new Date();
      const formattedDate = format(date, 'dd/MM/yyyy HH:mm:ss');     
      const randomId = 10000+Math.floor(Math.random()*90000);
      const total = totalAmount;
      const currentAddress = cartDetail[i].currentAddress[0];

      
              const order = new orderModel({
                "userId":userId,
                "productId":productId,
                "orderId":randomId,
                "userName":userName,
                "productName":productName,
                "totalAmount":total,
                "currentAddress":currentAddress,
                "date": formattedDate,
                "paymentMethod":cashOnDelivery,
                "currentStatus":status,
                

            })
            const savedData = await order.save();

    }
    // Respond with a success message
    res.status(200).json({ success: true, message: 'Order placed successfully.' });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};


exports.placeOrder2 = async(req,res)=>{
  try{
    const {productId,quantity,totalPrice,currentAddress} = req.body;
    const userId2 = req.session.user;
    const user = await UserModel.findById(userId2).exec();
    const product = await productModel.findById(productId).exec();
    const cashOnDelivery = "cashOnDelivery";
    const status = "Conformed";
    const userId = user._id;
    const productId2 = product._id;
    const productName = product.productName;
    const userName = user.name;
    const date = new Date();
      const formattedDate = format(date, 'dd/MM/yyyy HH:mm:ss');     
      const randomId = 10000+Math.floor(Math.random()*90000);
      
      const order = new orderModel({
        "userId":userId,
        "productId":productId,
        "orderId":randomId,
        "userName":userName,
        "productName":productName,
        "totalAmount":totalPrice,
        "currentAddress":currentAddress,
        "date": formattedDate,
        "paymentMethod":cashOnDelivery,
        "currentStatus":status,
        

    })
    const savedData = await order.save();
    res.status(200).json({ success: true, message: 'Order placed successfully.' });


  }catch(err){
    console.log(err);
  }
}

//online payment through razorpay
exports.generateRazorpay = async(req,res)=>{
     try{
        const {productId, quantity, total,currentAddress} = req.body;
        const onlinePayment = "Online Payment";
        const status = "pending";
        const userId = req.session.user;
        const user = await UserModel.findById(userId);
        const product = await productModel.findById(productId).exec();
        const productName = product.productName;
        const userName = user.name;
        const date = new Date();
        const randomId = 10000+Math.floor(Math.random()*90000);
      
        
        const orders = new orderModel({
          "userId":userId,
          "productId":productId,
          "orderId":randomId,
          "userName":userName,
          "productName":productName,
          "totalAmount":total,
          "currentAddress":currentAddress,
          "date":date,
          "paymentMethod":onlinePayment,
          "currentStatus":status,
    
      })
       const savedData = await orders.save();
     
       const order = await orderModel.findOne({productId:productId});
       console.log("heloo world");
       console.log(order);
       console.log("hihihih");
       const orderId = order._id;


     
        console.log(orderId);
        var options = {
          amount: total,  // amount in the smallest currency unit
          currency: "INR",
          receipt: orderId
        };
       
        const razorpayOrder = await new Promise((resolve,reject)=>{
          instance.orders.create(options,(err,order)=>{
            if(err){
              console.error("error creating razorpay order:",err);
              reject(err);
            }else{
              resolve(order);
            }
          });
        });
        console.log("Razorpay order:",razorpayOrder);

        res.status(200).json({success:true,order:razorpayOrder});

     }catch(err){
      console.error("error while online payment from serverside :",err);
      res.status(500).json({success:false,error:err.message});
     }
}


//verify payment
exports.verifyPayment = async(req,res)=>{
  try{ 
    const {payment,productId} = req.body;
    const userId = req.session.user;
    const current_Order = await orderModel.findOne({productId:productId}).exec();
    console.log("current order:",current_Order);
    console.log(payment);
    const current_orderId = current_Order._id;
    
   
   

    let hmac = crypto.createHmac('sha256',RAZORPAY_SECRET_KEY);
    hmac.update(payment. razorpay_order_id+'|'+payment. razorpay_payment_id); 
    hmac = hmac.digest('hex');
    if(hmac == payment.razorpay_signature){
      try{
        const status = "Placed";
        const filter = {_id:current_orderId};
        const updateDocument = {
          $set:{
            "currentStatus":status
          }
        };
        const result = await orderModel.updateOne(filter,updateDocument);
        console.log("kdjhkdfjgkjdfgdfgdfghhg");
        console.log(result);
        res.status(200).json({success:true,message:"order placed successfully"});
      }
      catch(err){
        console.log("error while updating the order ",err);
      }
      

    }else{

       const status = "Failed";
      const filter = {_id:current_orderId};
      const updateDocument = {
        $set:{
          "status":status
        }
      };
      const result = await orderModel.updateOne(filter,updateDocument);
      res.status(400).json({success:false,message:"failed to payment"});
    }
    

  

  }catch(err){
    console.error("error while varifying the payment form server!",err)
    res.status(500).json({success:false, message:"internal server error"});
  }
}

//oders
exports.oders = async(req,res)=>{
  try{
    const userId = req.session.user;
    const userData = await UserModel.findById(userId).exec();
    const userIdObj =  userData._id;
    console.log("userid",userIdObj);
    const orderDetails = await orderModel.aggregate([
      {
        $match:{userId:userIdObj}
      },
      {
        $lookup:{
          from:'products',
          localField:'productId',
          foreignField:'_id',
          as:"productDetail"
        }
      },{
        $sort:{
              date:-1
              }
      }
  ]).exec();
  console.log("corderDetails :",orderDetails )
  console.log("pro:",orderDetails [0].productDetail);
  res.render('orders',{orderDetails});

  }catch(err){
    console.error("error while getting oders",err);
    res.redirect('/getAccount');
  }
}

//cancel orders by user
exports.cancelOrder = async(req,res)=>{
  try{
        const {orderId} = req.body;
        console.log(orderId);
        await orderModel.deleteOne({_id:orderId}).exec();
        res.status(200).send({message:"order cancelled successfully"});
  }catch(err){
    console.error("error while canceling the order in server",err);
    res.status(500).send({error:"internal server error"});
  }
}

//update userprofile

exports.updateProfileDetails = async(req,res)=>{
  try{
      const userId = req.session.user;
      const name = req.body.name;
      const email = req.body.email;
      const number = req.body.number;

      if (!name || !email || !number) {   
      return res.status(400).json({ success: false, message: 'Name, email, and number are required.' });
    }

    await UserModel.findByIdAndUpdate(userId, {name,email,number}).exec();
    res.status(200).json({ success: true, message: 'Updated successfully.' });
  }catch(err){
    console.error("error while updating the user",err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

//change password 
exports.changePassword = async(req,res)=>{
  try{
       const userId = req.session.user;
       const saltRouds = 10;
       const {currentPassword,newPassword,conformPassword} = req.body;
       const hashedNewPassword = crypto.createHash('md5').update(newPassword).digest('hex');
       const hashedConformPassword = crypto.createHash('md5').update(conformPassword).digest('hex');

       const user = await UserModel.findById(userId).exec();
       const password = user.pass;
       const isPasswordMatch = await bcrypt.compare(currentPassword,password);
       console.log(isPasswordMatch);

       if(!isPasswordMatch){
          console.log("current password is incorrecnt");
          let count = 1 ;
         return res.status(200).json({success:true,message:"Current Password is incorrect",count});
       }      
       
       if(isPasswordMatch == true && (hashedNewPassword == hashedConformPassword) ){
             let count = 2 ;
             user.pass = await bcrypt.hash(newPassword,saltRouds);
             await user.save();
             res.status(200).json({ success: true, message: 'Updated successfully.' ,count});
       }else{
             let count = 3 ;
             res.status(200).json({success:true, message: 'Something went Wrong!!', count});
       }
       
       
    }
    
  catch(err){
    console.error("error while changing password",err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}


//sendResetOtpmail loginform reset password
exports.sendResetOtpmail = async(req,res)=>{
  try{
     const email = req.body.email;
     const otp = otpGenerator.generate(4, { upperCase: false, specialChars: false });
     const extime = moment().add(30,'seconds').toISOString();
     const saltRouds = 10;
     req.session.otpStorage = {
      otp,
      extime,
    };
    req.session.tempEmail = email;
    const user = await UserModel.findOne({ email: email});

    if (!user) {
      // Email not found in the database
      console.log("this email is not in the database");
      const count = 1;
     res.status(200).json({ success: true, message: 'Email not registered. Please sign up.',count });
      
    }else{

            // Create a Nodemailer transporter
            const transporter = nodemailer.createTransport({
              service: 'Gmail',
              auth: {
                user: email,
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
            const count = 0;
            res.status(200).json({success: true,message:"otp send successfully",})
  }
  }catch(err){
    console.error("error while sending otp",err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}


//conform otp while restting the password
exports.conformOTPResetPassword = async(req,res)=>{
  try{
     const otp = req.body.otp;
     const realOtp = req.session.otpStorage.otp;
     const expTime = req.session.otpStorage.extime;
     console.log("exptime",expTime);
     const currentTime = moment().toISOString();
     console.log("current time",currentTime);
    if(otp == realOtp && expTime > currentTime ){
      console.log("otp verified");
      res.status(200).json({success:true,message:"otp varified"});
    }
    else{
      console.log("incorrect otp");
      res.status(200).json({success:false,message:"incorrect otp"});
    }
  }catch(err){
    console.error("error while conforming the otp ",err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}


///resetPasswordLogin
exports.resetPasswordLogin = async(req,res)=>{
  try{
      const newPass = req.body.newPass;
      const email =  req.session.tempEmail;
      const saltRouds = 10;
      const hashedpassword = await bcrypt.hash(newPass,saltRouds);
      const user = await UserModel.findOne({email:email});
      if(user){
        user.pass = hashedpassword;
        await user.save();
        console.log("password updated");
        res.status(200).json({success:true,message:"password is updated successfully"});
      }else{
        res.status(200).json({success:true,message:"something went wrong !! password updation failed "});
      }
    


  }catch(err){
    console.error("error while updating the password ",err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};