
const UserModel = require('../models/userModel');
const orderModel = require('../models/ordersModel');
const coupenModel = require('../models/coupenModel');
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
const categoryModel = require('../models/categoryModel');
const { default: mongoose } = require('mongoose');
const productModel = require('../models/productModel');
const { render } = require('../routes/userRoute');
const {ObjectId} = mongoose.Types;
const { log } = require('console');
const crypto = require('crypto');
const { name } = require('ejs');
const { parse } = require('path');
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
        console.log("user:",user);
        const userId = new mongoose.Types.ObjectId(user);
        console.log("userId:",userId);
        const page = req.query.page || 1;
        let currentPage = parseInt(page);
        if(currentPage <= 0  ){
          currentPage = 1;
        }
        console.log("current page:",currentPage);
        const itemsPerPage = 3;
        let skip = (page - 1) * itemsPerPage;
        if(skip <= 0 ){
          skip = 0 ;
        }
        const totalCount = await productModel.countDocuments({isDeleted:false}).exec();
        console.log("totalcount:",totalCount);
        const totalPages = Math.floor(totalCount/itemsPerPage);
        console.log("totalpages:",totalPages);
        const productData = await productModel.aggregate([
               {
                $match:{"isDeleted":false},
               },
               {
                  $skip:skip
               },
               {
                  $limit:itemsPerPage
               }

        ])
               
        const categoryData = await categoryModel.find({isDelete:false}).exec();
        const Currentuser = await UserModel.find({"_id":userId})
        console.log("currentUser:",Currentuser);
        console.log("productDetails:",productData);
        const searchProduct = "";
        res.render('shop',{product:productData,category:categoryData,Currentuser,totalPages,currentPage,totalCount,searchProduct});
    }catch(error){
        console.error("error while fetching products",error);
        res.redirect('/');
    }
}

//get shop with price range 
exports.getShopWithPriceRange = async(req,res)=>{
  try{
    if(req.query.price1 && req.query.price2){
          const {price1,price2} = req.query;
          const user = req.session.user;
          const userId = new mongoose.Types.ObjectId(user);
          console.log("userId:",userId);
          const page = req.query.page || 1;
          let currentPage = parseInt(page);
          if(currentPage <= 0  ){
            currentPage = 1;
          }
          console.log("current page:",currentPage);
          const itemsPerPage = 3;
          let skip = (page - 1) * itemsPerPage;
          if(skip <= 0 ){
            skip = 0 ;
          }
          const totalCount = await productModel.countDocuments({isDeleted:false}).exec();
          console.log("totalcount:",totalCount);
          const totalPages = Math.floor(totalCount/itemsPerPage);
          console.log("totalpages:",totalPages);
          const productData = await productModel.aggregate([
              {
                $match:{
                    "isDeleted":false,
                    "price": {$gte: Number(price1), $lte:Number(price2) }
                }
              },
              {
                $skip:skip
              },
              {
                $limit:itemsPerPage
              },
              {
                $addFields:{
                  lastAmount:{
                    $multiply:[
                      "$price",
                      {$divide:["$offer",100]}
                    ]
                  }
                }
               }
          ])
            console.log("productData:",productData)     ;
          const categoryData = await categoryModel.find({isDelete:false}).exec();
          const Currentuser = await UserModel.find({"_id":userId})
          console.log("currentUser:",Currentuser);
          const searchProduct = "";
          res.render('shop',{product:productData,category:categoryData,Currentuser,totalPages,currentPage,totalCount,searchProduct});
    }

  }catch(error){
    console.error("error while getting shop according to the price ",error);
  }
}

//get shop with search
exports.getShopBySearch = async(req,res) =>{
       try{

        if(req.query){
          const searchProduct = req.query.searchProduct;
          console.log("searched product:",searchProduct);
          const user = req.session.user;
          const userId = new mongoose.Types.ObjectId(user);
          console.log("userId:",userId);
          const page = req.query.page || 1;
          let currentPage = parseInt(page);
          if(currentPage <= 0  ){
            currentPage = 1;
          }
          console.log("current page:",currentPage);
          const itemsPerPage = 3;
          let skip = (page - 1) * itemsPerPage;
          if(skip <= 0 ){
            skip = 0 ;
          }
          const totalCount = await productModel.countDocuments({isDeleted:false}).exec();
          console.log("totalcount:",totalCount);
          const totalPages = Math.floor(totalCount/itemsPerPage);
          console.log("totalpages:",totalPages);
          const productData = await productModel.aggregate([
             {
              $match:{
                "isDeleted":false,
                 "name": {$regex: searchProduct, $options: 'i'}
              }
             },
             {
              $skip:skip,
             },
             {
              $limit:itemsPerPage
             },
             {
              $addFields:{
                lastAmount:{
                  $multiply:[
                    "$price",
                    {$divide:["$offer",100]}
                  ]
                }
              }
             }
          ])
                  
          const categoryData = await categoryModel.find({isDelete:false}).exec();
          const Currentuser = await UserModel.find({"_id":userId})
          console.log("currentUser:",Currentuser);
          res.render('shop',{product:productData,category:categoryData,Currentuser,totalPages,currentPage,totalCount,searchProduct});
    }

       }catch(error){
          console.error("error while getting shop according to search",error);
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
        const user = req.session.user;
        const userDetail = await UserModel.findById(user);
        const cart = userDetail.cart;
        const prodId = req.params.id;
        const productData = await productModel.findById(prodId,{isDeleted:false}).exec();
        const stock = productData.stock;
        if(stock === 0){
          message = "Out Of Stock!!";
        }else{
          message = "Only "+ stock+" item left";
        }
        console.log("productData:",productData);
        res.render('selectedProduct',{productData,message,stock,userDetail,cart});
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
        }else if(user && user.status === false){
            const message = "User is blocked by the admin";
            res.render('login',{message});
        }else{
            const message = "User not found Please Sign Up!";
            res.render('login',{message});
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
      const {productId,size} = req.body;
      console.log("size:",size);
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
          size:size,
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
      console.log("products:",products);
      res.status(200).json({success:true,message:"item added to the cart ",products});
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
       const userid2 = new mongoose.Types.ObjectId(userId);
       
       const userData = await UserModel.findById(userId).exec();
       const wallet = userData.wallet;
       console.log("walletAmount:",wallet);
       const orders = await orderModel.find({userId:userId}).exec();
       console.log(orders);
       res.render('account',{orders,userData,wallet});
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
      const currentAddressId = userData.currentAddress;
      console.log("currentAddressId",currentAddressId);
      const productId = req.query.productId   ;
      console.log("productId:",productId);
      const productId2 = new mongoose.Types.ObjectId(productId);
      const quantity = req.query.quantity;
      const size = req.query.size;
      console.log("size:",size);
      const product2 = await productModel.findById(productId).exec();
      console.log("product2",product2);
      const totalPrice = product2.offerPrice * quantity ;
      const currentAddress = userData.address.filter(add => add._id.equals(currentAddressId));
      const product = await productModel.aggregate([
        {
          $match:{
            '_id':productId2
          }
        }
      ])
      console.log("productdetails:", product);
      res.render('checkout',{address,currentAddress,currentAddressId, product,quantity,totalPrice,productId,size});
  }catch(err){
    console.error("error while getting checkout",err);
    res.redirect('/shop');
  }
  
}
//from cart
exports.getCheckoutPage2 = async(req,res)=>{
  try{
    console.log("kjgjgfgjd");
    const {cart,totalAmount} = req.query;
    const userId = req.session.user;
    const userData = await UserModel.findById(userId).exec();
    const userIdObj =  userData._id;
    const address = userData.address || req.query.address;
    const currentAddressId = userData.currentAddress;
    const currentAddress = address.filter(add => add._id.equals(currentAddressId));

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
        },{
          $match:{
            "productDetail.stock":{$ne:0}
          }
        }
    ]).exec() || req.query.cartDetails
    console.log("total:",totalAmount);
    console.log("cartDetails:",cartDetails);
    console.log("productDetails:",cartDetails[0].productDetail)
    res.render('checkout2',{address,currentAddress,cartDetails,totalAmount,currentAddressId});
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
           let currentSize = cart[i].cart.size;
           
           if(cart[i].product[0].stock[currentSize].stock > 0){
            cartTotal = cartTotal + cart[i].cart.total;
           }
       }
       console.log("cart:",cart);
      console.log("productDetails:",cart[0].product);
   
  res.render('cart', {cart,cartTotal}); 
  }catch(err){
    console.error("error while getting produts ",err);
    res.redirect('/shop');
  }
}

//updateQuantity
exports.updateQuantity = async (req, res) => {
  try {
    const { productId, newQuantity ,currentQuantity,singleUnitPrice,size} = req.body;
    console.log("size:",size);
    const newTotal = newQuantity*singleUnitPrice;
    const newProductId = new mongoose.Types.ObjectId(productId);
    let cartTotal = 0;
    const userId = req.session.user; 
    const userId2 = new mongoose.Types.ObjectId(userId);
    const cartItem = await UserModel.findOneAndUpdate(
      {"_id":userId2,"cart":{$elemMatch:{"productId":newProductId,"size":size} } },
      {$set:{"cart.$.quantity":newQuantity,"cart.$.total":newTotal}},
      {new: true}
    );
    console.log("cartItem :",cartItem);
    for(let i = 0; i < cartItem.cart.length; i++){
          cartTotal = cartTotal+cartItem.cart[i].total;
    }
    
    res.status(200).json({ newQuantity ,newTotal,cartTotal});
   
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
      console.log("userId:",user);
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
            "houseNumber":address.formhouseNumber,
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

//save or add address form the checkout 
exports.addAddressFromCheckout = async(req,res)=>{
    try{
      const {address,product,quantity,totalPrice,productId} = req.body;
      const user = req.session.user;
      console.log("userId:",user);
      const newAddress = {
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
            "name":newAddress.formName,
            "number":newAddress.formNumber,
            "email":newAddress.formemail,
            "houseName":newAddress.formhouseName,
            "houseNumber":newAddress.formhouseNumber,
            "state":newAddress.formstate,
            "city":newAddress.formcity,
            "street":newAddress.formlandmark,
            "landMark":newAddress.formlandmark,
            "pin":newAddress.formpin
          }
        }
       },{new:true});
       const len = userData.address.length;
       const currentAddressId = userData.address[len-1]._id;
       const updateedUserData = await UserModel.findByIdAndUpdate(user,{$set:{"currentAddress":currentAddressId}});
       console.log("currentAddressId:",currentAddressId);
       const currentAddress = userData.address.filter(add => add._id.equals(currentAddressId));
       console.log("productId from server:",productId);
       res.status(200).json({success:true,message:"address inserted successfully",address,product,quantity,totalPrice,currentAddress,productId});

    }catch(err){
      console.log("error while adding the address from checkout",err);
      res.status(500).json({success:false,message:"error occured in adding address"});
    }
}

//add addressfrom checkout 2 
exports.addAddressFromCheckout2 = async(req,res) =>{
  try{
    const {address,cartDetails,totalAmount} = req.body;
    const user = req.session.user;
    console.log("userId:",user);
    const newAddress = {
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
          "name":newAddress.formName,
          "number":newAddress.formNumber,
          "email":newAddress.formemail,
          "houseName":newAddress.formhouseName,
          "houseNumber":newAddress.formhouseNumber,
          "state":newAddress.formstate,
          "city":newAddress.formcity,
          "street":newAddress.formlandmark,
          "landMark":newAddress.formlandmark,
          "pin":newAddress.formpin
        }
      }
     },{new:true});
     const userId = new mongoose.Types.ObjectId(user);
     const userData2 = await UserModel.find({"_id":userId});
     const len = userData2[0].address.length;
     const latestAddress  = userData2[0].address[len-1];
     const currentAddressIdStr = latestAddress._id ;
     const currentAddressId = new mongoose.Types.ObjectId(currentAddressIdStr);
     console.log("currentAddressId:",currentAddressId);
     const currentAddress = userData2.find(add => add._id.equals(currentAddressId));
     const updatedData = await UserModel.findByIdAndUpdate(user,{$set:{"currentAddress":currentAddressId}})
     console.log("cartDetails:",cartDetails);
     res.status(200).json({success:true,message:"address ading all successfull",currentAddress,address,cartDetails,totalAmount});

  }catch(error){
    console.error("error while updating the address from the serverside",error);
    res.status(500).json({success:false,message:"adding address is failed"});
  }
}

//show address page
exports.showAddress = async(req,res)=>{
  try{
    const userId = req.session.user;
    const userId2 = new mongoose.Types.ObjectId(userId);
    const userData = await UserModel.findById(userId2).exec();
    const address = userData.address;
    const currentAddressId = userData.currentAddress;
    console.log("currentAddressId:",currentAddressId);
    const currentAddress = address.filter(add => add._id.equals(currentAddressId));
    console.log(address);
    console.log("currentAddress:",currentAddress);
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
    const userId2 = new mongoose.Types.ObjectId(userId);
    const addressId = req.params.id;
    const addId = new mongoose.Types.ObjectId(addressId);
    console.log("addressId:",addId);
    const user = await UserModel.findOneAndUpdate(userId2,{$set:{"currentAddress":addId}});
    console.log("useris:",user);
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
    const address = (decodeURIComponent(req.query.address));
    const product = JSON.parse(decodeURIComponent(req.query.productDetails));
    const totalPrice = (decodeURIComponent(req.query.totalPrice)); 
    const addressId = (decodeURIComponent(req.query.addressId));
    const quantity =  (decodeURIComponent(req.query.quantity));
    const size = (decodeURIComponent(req.query.size));
    console.log("size:",size);
    const productId = product._id;
    const userId2 = new mongoose.Types.ObjectId(userId);
    const addId = new mongoose.Types.ObjectId(addressId);
    console.log("addressId:",addId);
    const user = await UserModel.findOneAndUpdate({"_id":userId2},{$set:{"currentAddress":addId}});
    user.save();
    console.log("currentaddressId :",addId);
    const currentAddress = user.address.filter(add => add._id.equals(addId));
    const currentAddressId = currentAddress._id;
    console.log("useris:",user);
   
  
    res.render('checkout',{address,currentAddress,product,currentAddressId,totalPrice,quantity,productId,size});
  } catch (err) {
    console.error("Error while updating the default address", err);
    res.redirect('/getCheckout');
  }
}

//setaddressFrom checkout 2
exports.setDefaultAddressFromCheckouts2 = async (req, res) => {
  try {
    const userId = req.session.user;
    const address = JSON.parse(decodeURIComponent(req.query.address))
    const cartDetails =JSON.parse(decodeURIComponent(req.query.cartDetail));
    const totalAmount = JSON.parse(decodeURIComponent(req.query.totalAmount)); 
    const addressId = (decodeURIComponent(req.query.addressId));
    const userId2 = new mongoose.Types.ObjectId(userId);
    const addId = new mongoose.Types.ObjectId(addressId);
    console.log("addressId:",addId);
    const user = await UserModel.findOneAndUpdate({"_id":userId2},{$set:{"currentAddress":addId}});
    user.save();
    console.log("currentaddressId :",addId);
    const currentAddress = user.address.filter(add => add._id.equals(addId));
    const currentAddressId = currentAddress._id;
    console.log("useris:",user);
    console.log("currentAddress",currentAddress);
    res.render('checkout2',{address,currentAddress,cartDetails,totalAmount,currentAddressId});
  } catch (err) {
    console.error("Error while updating the default address", err);
    console.log("testing te bugs2222222222222222222222222222222222222222222222222222")
    res.redirect('/getCheckout');
  }
}

//place order 
//place order 
exports.placeOrder = async (req, res) => {
  try {
    const { cartDetails,totalAmount} = req.body;
    console.log(cartDetails);
    const cashOnDelivery = "cashOnDelivery";
    const status = "Conformed";
    const userId = cartDetails[0]._id;
    const date = new Date();
    const formattedDate = format(date, 'dd/MM/yyyy HH:mm:ss');     
    const randomId = 10000+Math.floor(Math.random()*90000);
    const currentAddress = cartDetails[0].currentAddress;
    const total = cartDetails[0].cart.total;//need to fix it again
    const productId = [];
        for(let i = 0; i < cartDetails.length; i ++){

            const pro = cartDetails[i].cart;
            console.log("pro:",pro);
            const proId2 = pro.productId;
            const proId = new mongoose.Types.ObjectId(proId2);
            const size = pro.size;
            productId.push(pro);
            const quantity = pro.quantity;
            const currentProduct = await productModel.find({"_id":proId});
            console.log("currentProduct:",currentProduct);
            const currentStock = currentProduct[0].stock[size].stock;
            console.log("currentStock:",currentStock);
            const newStock = parseInt(currentStock - quantity);
            console.log("newStock:",newStock);
            const updatedStock = await productModel.findByIdAndUpdate({"_id":proId},{$set:{[`stock.${size}.stock`]:newStock}}).exec();
        }
      const order = new orderModel({
        "userId":userId,
        "products":productId,
        "orderId":randomId,
        "totalAmount":totalAmount,
        "currentAddress":currentAddress,
        "date": formattedDate,
        "paymentMethod":cashOnDelivery,
        "currentStatus":status,
    })
    const savedData = await order.save();

    // Respond with a success message
    res.status(200).json({ success: true, message: 'Order placed successfully.' });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};


exports.placeOrder2 = async(req,res)=>{
  try{
    const {productId,quantity,total,currentAddress,currentAddressId,size,coupen} = req.body;
    console/log
    ("coupen in serverside :",coupen);
    const userId2 = req.session.user;
    const user = await UserModel.findById(userId2).exec();
    const iscoupenExist = user.usedCoupen.find((ele)=> ele == coupen);
    if(iscoupenExist != undefined){
        res.status(200).json({success:true,message:"Coupen code Expired ! Please remove it"});

    }else{
              const product = await productModel.findById(productId).exec();
              const cashOnDelivery = "cashOnDelivery";
              const status = "Conformed";
              const userId = user._id;
              
              const productId2 = {
                "productId":product._id,
                "quantity":quantity,
                "price":total
              }
            
              const date = new Date();
                const formattedDate = format(date, 'dd/MM/yyyy HH:mm:ss');     
                const randomId = 10000+Math.floor(Math.random()*90000);
                
                const order = new orderModel({
                  "userId":userId,
                  "products":productId2,
                  "orderId":randomId,
                  "currentAddress":currentAddressId,
                  "totalAmount":total,
                  "date": formattedDate,
                  "paymentMethod":cashOnDelivery,
                  "currentStatus":status,
                  
          
              });
              const savedData = await order.save();
              const currentProduct = await productModel.find({"_id":productId});
              console.log("currentProduct:",currentProduct);
              const currentStock = currentProduct[0].stock[size].stock;
              console.log("currentStock:",currentStock);
              const newStock = parseInt(currentStock - quantity);
              console.log("newStock:",newStock);
              const updatedStock = await productModel.findByIdAndUpdate(
                {"_id":productId},
                {$set:{[`stock.${size}.stock`]:newStock}}).exec();
              
              const updatedUser = await UserModel.findByIdAndUpdate({"_id":userId2},{$push:{"usedCoupen":coupen}});
              console.log("order inserted successfully");
              res.status(200).json({ success: true,});
    }

  }catch(err){
    console.error("error in place order 2 ",err);
    res.status(500).json({success:false,message:"order placing has some issues"});
  }
}

//online payment through razorpay
exports.generateRazorpay = async(req,res)=>{
     try{
        const {productId, quantity, total,currentAddress,currentAddressId,size,coupen} = req.body;
        console.log("coupen from online payment:",coupen);
        const onlinePayment = "Online Payment";
        const status = "pending";
        const userid = req.session.user;
        const user = await UserModel.findById(userid);
        const iscoupenExist = user.usedCoupen.find((ele)=> ele == coupen);
        if(iscoupenExist != undefined){
            res.status(200).json({success:true,message:"Coupen code Expired! ! Please remove it"});
    
        }else{
              const userId = user._id;
              console.log("user....id:",userId);
              console.log("total:",total);
              const product = await productModel.findById(productId).exec();
              const productId2 = {
                "productId":product._id,
                "quantity":quantity,
                "price":total
              }
              const date = new Date();
          const formattedDate = format(date, 'dd/MM/yyyy HH:mm:ss');     
          const randomId = 10000+Math.floor(Math.random()*90000);
            
              const orders = new orderModel({
                "userId":userId,
                "products":productId2,
                "orderId":randomId,
                "totalAmount":total,
                "currentAddress":currentAddressId,
                "date":formattedDate,
                "paymentMethod":onlinePayment,
                "currentStatus":status,
          
            })
            const savedData = await orders.save();
            //updating the quantity
            const currentProduct = await productModel.find({"_id":productId});
            const currentStock = currentProduct[0].stock[size].stock;
            const newStock = parseInt(currentStock - quantity);
            const updatedStock = await productModel.findByIdAndUpdate(
              {"_id":productId},
              {$set:{[`stock.${size}.stock`]:newStock}}).exec();
            console.log("order inserted successfully");
            const updatedUser = await UserModel.findByIdAndUpdate({"_id":userid},{$push:{"usedCoupen":coupen}});

            //gettig orderId
            const totalOrders = await orderModel.find({});
            const totalOrderLength = totalOrders.length;
            const order = totalOrders[totalOrderLength-1];
            console.log("heloo world");
            console.log("order:",order);
            const orderId = order._id;
              console.log("orderId:",orderId);
              const total2 = parseInt(total) * 100;

              var options = {
                amount: total2,  
                currency: "INR",
                receipt: orderId
              };

            console.log("hello worldddddddddddddd");
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
              res.status(200).json({success:true,order:razorpayOrder,total2});
        }

     }catch(err){
      console.error("error while online payment from serverside :",err);
      res.status(500).json({success:false,error:err.message});
     }
}

//razorpay payment from checkout2 page
exports.generateRazorpayFromCheckout2 = async(req,res)=>{
  try{
      
    const { cartDetails,totalAmount,currentAddressId,size} = req.body;
    console.log(cartDetails);
    const cashOnDelivery = "Online Payment";
    const status = "Pending";
    const userId = cartDetails[0]._id;
    const date = new Date();
    const formattedDate = format(date, 'dd/MM/yyyy HH:mm:ss');     
    const randomId = 10000+Math.floor(Math.random()*90000);
    const currentAddress = cartDetails[0].currentAddress;
    const total = totalAmount;
    console.log("total amount from checkout2 ",total);
    const productId = [];
        for(let i = 0; i < cartDetails.length; i ++){

            const pro= cartDetails[i].cart;
            const proId = pro.productId
            console.log("productId:",proId);
            productId.push(pro);
            const quantity = pro.quantity;
            const size = pro.size;
            const currentProduct = await productModel.find({"_id":proId});
            console.log("currentProduct:",currentProduct);
            const currentStock = currentProduct[0].stock[size].stock;
            console.log("currentStock:",currentStock);
            const newStock = parseInt(currentStock - quantity);
            console.log("newStock:",newStock);
            const updatedStock = await productModel.findByIdAndUpdate({"_id":proId},{$set:{[`stock.${size}.stock`]:newStock}}).exec();
        }
      const neworder = new orderModel({
        "userId":userId,
        "products":productId,
        "orderId":randomId,
        "totalAmount":totalAmount,
        "currentAddress":currentAddress,
        "date": formattedDate,
        "paymentMethod":cashOnDelivery,
        "currentStatus":status,
    })
    const savedData = await neworder.save();
          //gettig orderId
          const totalOrders = await orderModel.find({});
          const totalOrderLength = totalOrders.length;
          const order = totalOrders[totalOrderLength-1];
          console.log("heloo world");
          console.log("order:",order);
          const orderId = order._id;
           console.log("orderId:",orderId);
           const total2 = parseInt(total) * 100;
   
           var options = {
             amount:  total2,  // amount in the smallest currency unit
             currency: "INR",
             receipt: orderId
           };
   
          console.log("hello worldddddddddddddd");
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
           res.status(200).json({success:true,order:razorpayOrder, total2});

  }catch(error){
    console.error("error in the razorpay implimentaion route from checkout2",error);
    res.status(500).json({success:false,message:"internal server error"});
  }
}


//verify payment
exports.verifyPayment = async(req,res)=>{
  try{ 
    console.log("hellow");
    const {payment,productId} = req.body;
    const userId = req.session.user;
    const totalOrders = await orderModel.find({});
    const totalOrderLength = totalOrders.length;
    const current_Order  = totalOrders[totalOrderLength-1];
    console.log("current order:",current_Order);
    console.log(payment);
    const current_orderId = current_Order._id;
    let hmac = crypto.createHmac('sha256',RAZORPAY_SECRET_KEY);
    hmac.update(payment. razorpay_order_id+'|'+payment. razorpay_payment_id); 
    hmac = hmac.digest('hex');
    if(hmac == payment.razorpay_signature){
      try{
        const status = "Conformed";
        const filter = {_id:current_orderId._id};
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
        res.status(400).json({success:false,message:"order placing has some issues "});
      }
    }else{
       const status = "Failed";
       const filter = {_id:current_orderId._id};
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


//varify payment 2 
exports.verifyPayment2 = async(req,res)=>{
  try{
    const { payment} = req.body;
    const userId = req.session.user;
    const totalOrders = await orderModel.find({});
    const totalOrderLength = totalOrders.length;
    const current_Order  = totalOrders[totalOrderLength-1];
    console.log("current order:",current_Order);
    console.log(payment);
    const current_orderId = current_Order._id;

    let hmac = crypto.createHmac('sha256',RAZORPAY_SECRET_KEY);
    hmac.update(payment. razorpay_order_id+'|'+payment. razorpay_payment_id); 
    hmac = hmac.digest('hex');
    if(hmac == payment.razorpay_signature){
      try{
        const status = "Conformed";
        const filter = {_id:current_orderId._id};
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
        res.status(400).json({success:false,message:"order placing has some issues "});
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
  }catch(error){
    console.error("error while varifying payment 2 ",error);
  }
}

//oders
exports.oders = async(req,res)=>{
  try{
    const userId = req.session.user;
    const userData = await UserModel.findById(userId).exec();
    const page = req.query.page || 1;
    let currentPage = parseInt(page);
    if(currentPage <= 0  ){
      currentPage = 1;
    }
    console.log("currnet page:",currentPage);
    const itemsPerPage = 3;
    let skip = (page-1)*itemsPerPage;
    if(skip <= 0 ){
      skip = 0 ;
    }
    const totalOrders = await orderModel.aggregate([
      {
        $unwind:"$products"
      }
    ])
    const totalCount = totalOrders.length;
    console.log("total count:",totalCount);
    const totalPages = Math.ceil(totalCount/itemsPerPage);
    console.log("total pages:",totalPages);
    const userIdObj =  userData._id;
    console.log("userid",userIdObj);
    const orderDetails = await orderModel.aggregate([
      {
        $match:{userId:userIdObj}
      },
      {
         $unwind : "$products"
      },
      {
        $lookup:{
          from:'products',
          localField:'products.productId',
          foreignField:'_id',
          as:"productDetail"
        }
      },
      {
        $lookup:{
          from:'users',
          let: { userId: '$userId' },
          pipeline: [
            {
              "$match": {
                $expr: {
                  $eq: ['$$userId', '$_id']
                }
              }
            },
            {
              "$unwind": "$address"
            },
            {
              "$addFields": {
                "currentAddressMatched": {
                  "$eq": ["$currentAddress", "$address._id"]
                }
              }
            },
            {
              "$match": {
                "currentAddressMatched": true
              }
            },
            {
              "$project": {
                "currentAddress": "$address"
              }
            }
          ],
          as:"currentAddress"
        }
      },
      {
        $sort:{
              date:-1
              }
      },
      
      {
        $skip:skip
      },
      {
        $limit:itemsPerPage
      },
     
     
  ]).exec();
  console.log("corderDetails :",orderDetails )
  console.log("pro:",orderDetails [0].currentAddress[0].currentAddress.name);
  res.render('orders',{orderDetails,totalPages,currentPage});

  }catch(err){
    console.error("error while getting oders",err);
    res.redirect('/getAccount');
  }
}

//cancel orders by user
exports.cancelOrder = async(req,res)=>{
  try{
        const user = req.session.user;
        const userId = new mongoose.Types.ObjectId(user);
        let userDetail = await UserModel.findById(userId);
        console.log("userDetails:",userDetail);
        const {orderId} = req.body;
        const orderId2 = new mongoose.Types.ObjectId(orderId);
        const status = "Cancelled";
        const orders = await orderModel.findById(orderId2);
        console.log("orders:",orders);
        const price = orders.totalAmount;
        const orderMethod = orders.paymentMethod;
        console.log("price:",price);
        console.log("orderMethod:",orderMethod);
        await orderModel.findByIdAndUpdate({"_id":orderId2},{$set:{"currentStatus":status}});
        if(orderMethod == "Online Payment"){
             console.log("in this jngggg");
             let walletAmount = userDetail.wallet;
             newAmount = walletAmount +  price;
             await UserModel.findByIdAndUpdate({"_id":userId},{$set:{"wallet":newAmount}});
         }
       

        res.status(200).send({message:"order cancelled successfully"});
  }catch(err){
    console.error("error while canceling the order in server",err);
    res.status(500).send({error:"internal server error"});
  }
}

//wallet1 
exports.wallet1 = async(req,res)=>{
   try{
       const {productId,quantity,total,currentAddress,currentAddressId,size,coupen} = req.body;
       console.log("coupen get from wallet payment in server:",coupen);
       const user = req.session.user;
       const userId = new mongoose.Types.ObjectId(user);
       const userDetails = await UserModel.findById(userId);
       const iscoupenExist = userDetails.usedCoupen.find((ele)=> ele == coupen);

       if( coupen !== undefined && iscoupenExist != undefined){
           res.status(200).json({success:true,message:"Coupen code Expired! ! Please remove it"});
   
       }else{
              const product = await productModel.findById(productId);
              const walletPayment = "Wallet Payment";
              const status = "Conformed";
              console.log("userDetails:",userDetails);
              let walletAmount = userDetails.wallet;
              console.log("walletAmount:",walletAmount);
              console.log("totalPrice:",total);

              const productId2 = {
                "productId":product._id,
                "quantity":quantity,
                "price":total
              }

              const date = new Date();
              const formattedDate = format(date, 'dd/MM/yyyy HH:mm:ss');     
              const randomId = 10000+Math.floor(Math.random()*90000);
              
              if(total <= walletAmount){
                    console.log("wallet payment enabled");
                    const order = new orderModel({
                      "userId":userId,
                      "products":productId2,
                      "orderId":randomId,
                      "currentAddress":currentAddressId,
                      "totalAmount":total,
                      "date": formattedDate,
                      "paymentMethod":walletPayment,
                      "currentStatus":status,
                      
              
                  });
                  const savedData = await order.save();
                  const currentProduct = await productModel.find({"_id":productId});
                  console.log("currentProduct:",currentProduct);
                  const currentStock = currentProduct[0].stock[size].stock;
                  console.log("currentStock:",currentStock);
                  const newStock = parseInt(currentStock - quantity);
                  console.log("newStock:",newStock);
                  const updatedStock = await productModel.findByIdAndUpdate(
                    {"_id":productId},
                    {$set:{[`stock.${size}.stock`]:newStock}}).exec();
                    if(coupen != undefined){
                      const updatedUser = await UserModel.findByIdAndUpdate({"_id":user},{$push:{"usedCoupen":coupen}});
                    }

                  let newWalletAmount = walletAmount - total; 
                  await UserModel.findByIdAndUpdate({"_id":userId},{$set:{"wallet":newWalletAmount}});
                  console.log("order inserted successfully");
                  res.status(200).json({ success: true,});
                }else{
                    console.log("wallete amount is not sufficient for this particular order");
                    let pointer ;
                    res.status(200).json({success:true,message:"wallet amount is not sufficient",pointer});
                 }
        }

   }catch(error){
    console.log("error occured during wallet payment!!",error);
    res.status(500).json({success:false,message:"error occured"});
   }
}

//wallet2
exports.wallet2 = async(req,res)=>{
   try{
        const { cartDetails,totalAmount} = req.body;
        console.log(cartDetails);
        const walletPayment = "Wallet Payment";
        const status = "Conformed";
        const userId = cartDetails[0]._id;
        const userDetails = await UserModel.findById(userId);
        console.log("userDetails:",userDetails);
        const walletAmount = userDetails.wallet;
        if(totalAmount <= walletAmount){
              const date = new Date();
              const formattedDate = format(date, 'dd/MM/yyyy HH:mm:ss');     
              const randomId = 10000+Math.floor(Math.random()*90000);
              const currentAddress = cartDetails[0].currentAddress;
              const total = cartDetails[0].cart.total;//need to fix it again
              const productId = [];
                  for(let i = 0; i < cartDetails.length; i ++){
      
                      const pro = cartDetails[i].cart;
                      console.log("pro:",pro);
                      const proId2 = pro.productId;
                      const proId = new mongoose.Types.ObjectId(proId2);
                      const size = pro.size;
                      productId.push(pro);
                      const quantity = pro.quantity;
                      const currentProduct = await productModel.find({"_id":proId});
                      console.log("currentProduct:",currentProduct);
                      const currentStock = currentProduct[0].stock[size].stock;
                      console.log("currentStock:",currentStock);
                      const newStock = parseInt(currentStock - quantity);
                      console.log("newStock:",newStock);
                      const updatedStock = await productModel.findByIdAndUpdate({"_id":proId},{$set:{[`stock.${size}.stock`]:newStock}}).exec();
                  }
                const order = new orderModel({
                  "userId":userId,
                  "products":productId,
                  "orderId":randomId,
                  "totalAmount":totalAmount,
                  "currentAddress":currentAddress,
                  "date": formattedDate,
                  "paymentMethod":walletPayment,
                  "currentStatus":status,
              })
              const savedData = await order.save();
              // Respond with a success message
              res.status(200).json({ success: true, message: 'Order placed successfully.' });
        }else{
             res.status(200).json({success:true,message:"Your Wallet amount is insufficient for this Order\n Please try another Payment Method"})
        }
   }catch(error){
     console.log("error occured in the wallet payment in wallet 2!!",error);
     res.status(500).json({success:false,message:"error occured"})
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


//apply coupen code
exports.applyCoupenCode = async(req,res)=>{
    try{
         const {coupen,address,currentAddress,currentAddressId,product,quantity,totalPrice,productId,size} = req.body;
         console.log("coupen entered is :",coupen);
         const allCoupen = await coupenModel.find();
         console.log("all coupen :",allCoupen);
         const findedElement = allCoupen.find((ele)=> ele.code == coupen);
         console.log("findedElemnt",findedElement);
         if(findedElement == undefined){
             
             res.status(200).json({success:true,message:"Entered Coupen is currently unavailable"});

         }else{
             coupenOffer = findedElement.offer;
             console.log("offfer of the specified coupen:",coupenOffer);
             console.log("total price:",totalPrice);
             const newTotalPrice = totalPrice -((coupenOffer/100)*totalPrice ) ;
             console.log("new price with coupen offer is :",newTotalPrice);

             res.status(200).json({success:true,newTotalPrice,address,currentAddress,currentAddressId,product,quantity,productId,size,totalPrice});

         }
        
    }catch(error){
      console.error("error occured while applying coupen code!!",error);
      res.status(500).json({success:false,message:"error ocucred"});
    }
}