
const UserModel = require('../../models/userModel');
const orderModel = require('../../models/ordersModel');
const coupenModel = require('../../models/coupenModel');
const otpGenerator = require('otp-generator');
const nodemailer = require('nodemailer');
const bcrypt  = require('bcrypt');
const moment =  require('moment');
const uuid = require('uuid');
const easyinvoice = require('easyinvoice');

const { format } = require('date-fns');
const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: 'iamsandeep6969400@gmail.com',
    pass: 'newmailpass',
  },
});

const categoryModel = require('../../models/categoryModel');
const { default: mongoose } = require('mongoose');
const productModel = require('../../models/productModel');
const {ObjectId} = mongoose.Types;
const crypto = require('crypto');
const { error } = require('console');

exports.home = async(req,res)=>{
    res.render("index");
}

exports.loginPage = async(req,res,next)=>{
  try{
      const message = "Lets Go";
      res.render("login",{message});
  }catch(error){
      console.log("error while getting login page");
      next(error);
  }
}

//get signup page
exports.signupPage = async(req,res,next)=>{
  try{
      res.render('signup');
  }catch(error){
      console.log("error while getting signup page ");
      next(error);
  }
}

exports.shopPage = async(req,res,next)=>{
    try{
        if(req.query.product){
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
                      const productData = decodeURIComponent(req.query.product);
                      const product = JSON.parse(productData);                            
                      const categoryData = await categoryModel.find({isDelete:false}).exec();
                      const Currentuser = await UserModel.find({"_id":userId})
                      console.log("currentUser:",Currentuser);
                      console.log("productDetails:",productData);
                      const searchProduct = "";
                      res.render('shop',{product:product,category:categoryData,Currentuser,totalPages,currentPage,totalCount,searchProduct});
        }
       
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
                $lookup:{
                  from:"categories",
                  localField:"category",
                  foreignField:"_id",
                  as:"categoryDetails"
                }
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
        next(error);
    }
}

//get shop with price range 
exports.getShopWithPriceRange = async(req,res,next)=>{
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
                $lookup:{
                 from:"categories",
                 localField:"category",
                 foreignField:"_id",
                 as:"categoryDetails"
                }
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
    next(error);
  }
}

//get shop with search
exports.getShopBySearch = async(req,res,next) =>{
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
                  $lookup:{
                    from:"categories",
                    localField:"category",
                    foreignField:"_id",
                    as:"categoryDetails"
                  }
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
              console.log("productData :",productData);
              res.render('shop',{product:productData,category:categoryData,Currentuser,totalPages,currentPage,totalCount,searchProduct});
          }
       }catch(error){
          console.error("error while getting shop according to search",error);
          next(error);
       }
}

//get product by category
exports.categoryBasedProduct = async(req,res,next)=>{
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
           },
           {
            $lookup:{
              from:"categories",
              localField:"category",
              foreignField:"_id",
              as:"categoryDetails"
            }
           }
           
    ]).exec();
    console.log("products from the category based bsed product:",productData);
    res.status(200).json({success:true,product:productData,category:categoryData});
  }catch(err){
    console.error("error getting the product in the category",err);
    next(error);
  }
}

//selected product
exports.selectedProduct = async(req,res,next)=>{
    try{
        const user = req.session.user;
        const userDetail = await UserModel.findById(user);
        const cart = userDetail.cart;
        const prodId = req.params.id;
        const productId = new mongoose.Types.ObjectId(prodId);
        const productData = await productModel.aggregate([
          {
            $match:{
              "_id":productId,
              "isDeleted":false
            }
          },{
            $lookup:{
              from:"categories",
              localField:"category",
              foreignField:"_id",
              as:"categoryDetail"

            }
          }
        ])
        const stock = productData[0].stock;
        if(stock === 0){
          message = "Out Of Stock!!";
        }else{
          message = "Only "+ stock+" item left";
        }
        console.log("productData:",productData);
        res.render('selectedProduct',{productData,message,stock,userDetail,cart});
    }catch(error){
        console.error("error while fetching products",error);
        next(error);
    }
}

exports.contactPage = async(req,res,next)=>{
  try{
      res.render('contact');
  }catch(error){
      console.log("error while getting the contact page ",error);
      next(error);
  }
}

//get otp page
exports.getOtpPage = async(req,res,next)=>{
  try{
      let referredUserId = "";
      if(req.query.referredUser){
        console.log("referred user from query",req.query.referredUser);
        referredUserId = req.query.referredUser ;
        console.log("reffered user :",referredUserId);
      }
        const message = "Enter OTP ";
        res.render('otp',{message,referredUserId});
  }catch(error){
      console.log("error while getting otp page !!",error);
      next(error);
  }
}

exports.userEntry = async(req,res,next)=>{
    try{
        const {Email,Password} = req.body;
        console.log(Email);
        console.log(Password);
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
        next(error);
    }
};

exports.signup = async(req,res,next)=>{
    try{
    // Generate a random OTP
    const referralCode = req.body.referralCode;
    console.log("referrla code in serverside:",referralCode);
    const userDetails = await UserModel.find();
    console.log("phone number:",req.body.number);
    
    const isExistReferalCode = userDetails.find((ref)=> ref.referralCode == referralCode);

    if (referralCode != "" && isExistReferalCode == undefined){

           res.status(200).json({success:true,message:"The provided referral code is Expired!"});

    }else{
          let  updatedReferredUser = "";
          if(referralCode != ""){
            console.log("referal code after varification:",referralCode);
            referredUser = userDetails.find((ref)=> ref.referralCode == referralCode);
            referredUserId = referredUser._id;
            console.log("referred user:",referredUser);
            updatedReferredUser = referredUserId;
            console.log("refered userid",updatedReferredUser);
          }
          const otp = otpGenerator.generate(4, { upperCase: false, specialChars: false });
          const extime = moment().add(30,'seconds').toISOString();
          const saltRouds = 10;
          const hashedpassword = await bcrypt.hash(req.body.pass,saltRouds);
          req.session.otpStorage = {
              otp,
              expirationTime: extime,
            };
        req.session.userData ={
          "username":req.body.username,
          "email":req.body.email,
          "phonenumber":req.body.number,
          "password":hashedpassword,
          "referralCode":req.body.referralCode,
        }
        console.log(req.session.otpStorage);
          // Create a Nodemailer transporter
          const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
              user: process.env.EMAIL,
              pass: process.env.PASSWORD,
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
              if(updatedReferredUser != ""){
                 res.status(200).json({success:true,updatedReferredUser});
              }else{
                res.status(200).json({success:true});
              }
            }
          });
    }
    }catch(error){
        console.error("Error during signup:",error);
        next(error);
    }
};

//resendOTP when signUp
exports.resendOTP = async(req,res,next)=>{
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
          user: process.env.EMAIL,
          pass: process.env.PASSWORD,
         },
         });
    
  
      // Email configuration
      const mailOptions = {
        from: 'sandeeps@gmail.com',
        to: '2002m9002@gmail.com',
        subject: 'Resend OTP Verification',
        text: `Your new OTP is: ${otp}`,
      };
     
      console.log("mail details:",mailOptions);
      // Send the email with the new OTP
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
          next(error);
        } else {
          console.log('Email sent:', info.response);
          const message = "otp resended ";
          res.status(200).json({success:true,message});
        }
      });
    } catch (error) {
      console.error("Error resending OTP:", error);
      next(error)
    }
}

//resent otp for resetPassword in login
exports.reSendotpResetPassword = async(req,res,next)=>{
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
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
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

  }catch(error){
    console.error("error in resending the otp while login",error);
    next(error);
  }
}

//varify otp for signup
exports.verifyOtp = async (req, res , next) => {
    try {
    const {userotp,referredUserId} = req.body;
    console.log("referred User Id :",referredUserId);
    
    const otpStorage = req.session.otpStorage.otp;
    const currentTimeStamp = moment();
    const exTime = req.session.otpStorage.expirationTime;
    const exTimeMoment = moment(exTime);
    const userData = req.session.userData;
    console.log(currentTimeStamp);
    console.log(exTime);
    if(userotp === otpStorage){
      const referralCode = uuid.v4().substring(0, 5);
      console.log("referral code is :",referralCode);

      const data = new UserModel({
        "name":userData.username,
        "userid":userData.userid,
        "email":userData.email,
        "number":userData.phonenumber,
        "pass":userData.password,
        "referralCode":referralCode
        
    });
    console.log("phone number:",userData.phonenumber);
    if(currentTimeStamp.isBefore(exTimeMoment)){
            const {name} = data;
            console.log(name);
            const savedData = await data.save();
            req.session.user = savedData._id;
            console.log(req.session.user);
            if(savedData){
                console.log("Record inserted successfully");
                if(referredUserId != ""){
                    console.log("referrredUserId varification in varify payment:",referredUserId);
                    let updatedReferredUser2 = await UserModel.findByIdAndUpdate({"_id":referredUserId},{$inc:{"wallet":100}});

                    let updatedNewUser = await UserModel.findByIdAndUpdate(
                      { "_id": savedData._id },
                      { $inc: { "wallet": 100 } }
                     );
                    res.redirect('/shop');
                }else{
                  res.redirect('/shop');
                }
              
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
      next(error);
    }
  }

  //adding  cart
  exports.addToCart = async(req,res,next)=>{
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
    }catch(error){
        console.log("error while geting cart",error);
        next(error);
    }
  }

//cartItemDelete
exports.cartItemDelete = async(req,res,next)=>{
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
        res.status(200).json({success:true,message:"deleted successfully"});
      }else{
        console.log("product not found in the cart");
      }
    }else{
      console.log("item not deleted");
      res.status(200).json({success:true,message:"item not delted"});
    }
  }catch(error){
    console.error("error while deleting the cart",error);
    next(error);
  }
}

exports.logout = (req,res,next)=>{
  try{
      req.session.destroy((err)=>{
        if(err){
            console.error("Error distroying session",err);
        }else{
            res.redirect('/');
        }
      });
  }catch(error){
      console.log("error while logouting the user!",error);
      next(error);
  }
    
}

/****** get from navbar***********/
exports.getAccount = async(req,res,next)=>{
  try{
       const userId = req.session.user;
       const userid2 = new mongoose.Types.ObjectId(userId);
       const userData = await UserModel.findById({"_id":userId}).exec();
       const avacoupens  = await coupenModel.find({"listed":true});
       console.log("available coupens :",avacoupens);
       const wallet = userData.wallet;
       console.log("walletAmount:",wallet);
       const orders = await orderModel.find({userId:userId}).exec();
       console.log(orders);
       res.render('account',{orders,userData,wallet,avacoupens});
  }catch(err){
      console.error("error while get account ");
      next(error);
  }
}

//show user wallet
exports.showUserWallet = async(req,res,next)=>{
  try{ 
    const userId  = req.session.user;
    const id = new mongoose.Types.ObjectId(userId);
    const userDetails = await UserModel.find(id);
    console.log("inside the wallet page function");
    const walletHis = await orderModel.aggregate([
      {
        $match:{
          "paymentMethod":"Wallet Payment"
        }
      },
      {
        $unwind:"$products"
      },
      {
        $lookup:{
          from:"products",
          localField:"products.productId",
          foreignField:"_id",
          as:"productDetails"
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
    ])
    console.log("wallet history is :",walletHis);
    console.log("userDetails",userDetails);
    res.render('showWallet',{walletHis,userDetails});

  }catch(error){
    console.log("error while getting the wallet page",error);
    next(error);
  }
}
exports.getWishlist = async(req,res)=>{
    res.render('wishlist');
}

exports.getCheckoutPage = async(req,res,next)=>{
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
      console.log("prod:",product2.offerPrice);
      const totalPrice = product2.offerPrice * quantity ;
      const currentAddress = userData.address.filter(add => add._id.equals(currentAddressId));
      const product = await productModel.aggregate([
        {
          $match:{
            '_id':productId2
          }
        },{
          $lookup:{
            from:"categories",
            localField:"category",
            foreignField:"_id",
            as:"categoryDetail",
          }
        },
       
      ])
      console.log("productdetails:", product[0]);
      res.render('checkout',{address,currentAddress,currentAddressId, product,quantity,totalPrice,productId,size});
  }catch(err){
    console.error("error while getting checkout",err);
    next(error);
  }
  
}
//from cart
exports.getCheckoutPage2 = async(req,res,next)=>{
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
        },{
          $lookup:{
            from:"categories",
            localField:"productDetail.category",
            foreignField:"_id",
            as:"categoryDetail"
          }
        }
    ]).exec() || req.query.cartDetails
    console.log("total:",totalAmount);
    console.log("cartDetails:",cartDetails);
    console.log("productDetails:",cartDetails[0].productDetail)
    console.log("categorydetails:",cartDetails[0].categoryDetail[0])
    console.log("total amount ",totalAmount);
    res.render('checkout2',{address,currentAddress,cartDetails,totalAmount,currentAddressId});
  }catch(err){
      console.log("error in getcheckout2 ",err);
      next(error);
  }
}

exports.getCart = async(req,res,next)=>{
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
        },{
          $lookup:{
            from:"categories",
            localField:"product.category",
            foreignField:"_id",
            as:"categoryDetails"
          }
        }
       ]);

       for(let i = 0; i < cart.length; i++){
           let currentSize = cart[i].cart.size;
           
           if(cart[i].product[0].stock[currentSize].stock > 0){
            cartTotal = cartTotal + cart[i].cart.total;
           }
       }
       console.log("cartTotal:",cartTotal);
       console.log("cart:",cart);
   
  res.render('cart', {cart,cartTotal}); 
  }catch(err){
    console.error("error while getting produts ",err);
    next(error);
  }
}

//updateQuantity
exports.updateQuantity = async (req, res,next) => {
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
    next(error);
  }
};

//add address
exports.addAddressPage = async(req,res,next)=>{
  try{
    res.render('addAddress');
  }catch(err){
    console.error("error while loading add Address page",err);
    next(error);
  }
}

//adresss
exports.address = async(req,res,next)=>{
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
    next(error);
  }
}

//save userAddress
exports.saveAddress = async(req,res,next)=>{
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
    next(error);
  }
}

//save or add address form the checkout 
exports.addAddressFromCheckout = async(req,res,next)=>{
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
      next(error);
    }
}

//add addressfrom checkout 2 
exports.addAddressFromCheckout2 = async(req,res,next) =>{
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
    next(error);
  }
}

//show address page
exports.showAddress = async(req,res,next)=>{
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
    next(error);
  }
}

//address delete
exports.addressDelete = async(req,res,next)=>{
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
        res.status(200).json({success:true,message:"deleted successfully"});
      }else{
        console.log("address not found in the database");
      }
    }
  }catch(err){
    console.error("error while deleting the address",err);
    next(error);
  }
}

exports.setDefaultAddress = async (req, res,next) => {
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
    next(error);
  }
}

//setaddressFrom checkout
exports.setDefaultAddressFromCheckouts = async (req, res,next) => {
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
    res.render('checkout',{address,currentAddress,product,currentAddressId,totalPrice,quantity,productId,size,addressId});
  } catch (err) {
    console.error("Error while updating the default address", err);
    next(error);
  }
}

//setaddressFrom checkout 2
exports.setDefaultAddressFromCheckouts2 = async (req, res,next) => {
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
    next(error);
  }
}

//oders
exports.oders = async(req,res,next)=>{
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
        res.render('orders',{orderDetails,totalPages,currentPage});
  }catch(err){
    console.error("error while getting oders",err);
    next(error);
  }
}

//cancel orders by user
exports.cancelOrder = async(req,res,next)=>{
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
    next(error);
  }
}

//update userprofile
exports.updateProfileDetails = async(req,res,next)=>{
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
    next(error);
  }
}

//change password 
exports.changePassword = async(req,res,next)=>{
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
    next(error);
  }
}

//sendResetOtpmail loginform reset password
exports.sendResetOtpmail = async(req,res,next)=>{
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
    next(error);
  }
}

//conform otp while restting the password
exports.conformOTPResetPassword = async(req,res,next)=>{
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
    next(error);
  }
}

///resetPasswordLogin
exports.resetPasswordLogin = async(req,res,next)=>{
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
    next(error);
  }
};

//apply coupen code
exports.applyCoupenCode = async(req,res,next)=>{
    try{
         const {coupen,address,currentAddress,currentAddressId,product,quantity,totalPrice,productId,size} = req.body;
         const date = new Date;
         let formattedDate = (date.getMonth() + 1).toString().padStart(2, '0') + "/" +
                    date.getDate().toString().padStart(2, '0') + "/" +
                    date.getFullYear().toString();
         console.log("Formatted date: ", formattedDate);
         const userid = req.session.user;
         const userid2 = new mongoose.Types.ObjectId(userid);
         const userDetails = await UserModel.find({"_id":userid2});
         console.log("userdetails in appp",userDetails);
         const usedCoupen = userDetails[0].usedCoupen;
         console.log("usedcoupens in applycoupencode:",usedCoupen);
         //checking the entered coupen is used or not?
         const ifusedCoupen = usedCoupen.find((cp)=>cp == coupen);
         console.log("coupen entered is :",coupen);
         const allCoupen = await coupenModel.find();
         console.log("all coupen :",allCoupen);
         const findedElement = allCoupen.find((ele)=> ele.code == coupen);
         console.log("findedElemnt",findedElement);
         if(findedElement  == undefined){
             res.status(200).json({success:true,message:"Entered Coupen is currently unavailable"});
         }else if( ifusedCoupen == coupen){
            res.status(200).json({success:true,message:"Entered Coupen is currently unavailable"});
         }else if(totalPrice < findedElement.minCartAmount ){
            res.status(200).json({success:true,message:`coupen can appply aboue rs ${findedElement.minCartAmount}`});
         }else if(formattedDate > findedElement.expiryDate){
           res.status(200).json({success:true,message:"The coupen was Expired"});
         }else{
             coupenOffer = findedElement.offer;
             console.log("offfer of the specified coupen:",coupenOffer);
             console.log("total price:",totalPrice);
             const redeemAmount = findedElement.maxReedeemableAmount;
             console.log("redemamount :",redeemAmount);
             let newTotalPrice = 0;
             if(findedElement.offerType === "percentage"){
                  if(totalPrice > redeemAmount){
                    console.log("price before:",totalPrice);
                     newTotalPrice = Math.round(totalPrice -((coupenOffer/100)*redeemAmount) );
                     console.log("price after:",newTotalPrice);
    
                  }else{
                     newTotalPrice = Math.round(totalPrice -((coupenOffer/100)*totalPrice));
                  }
             }else{
                  if(totalPrice > redeemAmount){
                    newTotalPrice = totalPrice - findedElement.offer;

                  }else{
                      newTotalPrice = totalPrice - findedElement.offer;
                  }
             }
           
             console.log("new price with coupen offer is :",newTotalPrice);
             res.status(200).json({success:true,newTotalPrice,address,currentAddress,currentAddressId,product,quantity,productId,size,totalPrice});
         }
    }catch(error){
      console.error("error occured while applying coupen code!!",error);
      next(error);
    }
}

//applyCoupenCodeFromCheckout2
exports.applyCoupenCodeFromCheckout2 = async(req,res,next)=>{
  try{
    const {coupen,cartDetails,totalAmount} = req.body;
    console.log("total amount is :",totalAmount);
    const date = new Date;
    let formattedDate = (date.getMonth() + 1).toString().padStart(2, '0') + "/" +
               date.getDate().toString().padStart(2, '0') + "/" +
               date.getFullYear().toString();
    console.log("Formatted date: ", formattedDate);
    console.log("coupen entered is :",coupen);
    const allCoupen = await coupenModel.find();
    const userid = req.session.user;
    const userid2 = new mongoose.Types.ObjectId(userid);
    const userdetails = await UserModel.find({"_id":userid2});
    console.log("userDetails:",userdetails);
    const usedcoupens = userdetails[0].usedCoupen;
    console.log("usedCoupens are:",usedcoupens);
    //checking the user entered coupen is used or not before
    let  coupenUsed = usedcoupens.find((cp)=> cp === coupen);
    console.log("usedcoupen:",coupenUsed);
    console.log("all coupen :",allCoupen);
    const findedElement = allCoupen.find((ele)=> ele.code == coupen);
    console.log("findedElemnt",findedElement);
    if(findedElement == undefined){
        res.status(200).json({success:true,message:"Entered Coupen is currently unavailable1"});
    }else if(coupenUsed !== undefined ){
        res.status(200).json({success:true,message:"Entered Coupen is currently unavailable2"});
    }else if(totalAmount < findedElement.minCartAmount){
        res.status(200).json({success:true,message:`coupen can only apply above ${findedElement.minCartAmount} Rs`});
    }else if(findedElement.expiryDate < formattedDate){
      res.status(200).json({success:true,message:"Coupen was Expired"});

    }else{
        coupenOffer = findedElement.offer;
        console.log("offfer of the specified coupen:",coupenOffer);
        console.log("total price:",totalAmount);
        const redeemAmount = findedElement.maxReedeemableAmount;
        console.log("redemamount :",redeemAmount);
        let newTotalPrice = 0;
        if(findedElement.offerType === "percentage"){
             if(totalAmount > redeemAmount){
               console.log("price before:",totalAmount);
                newTotalPrice = Math.round(totalAmount -((coupenOffer/100)*redeemAmount) );
                console.log("price after:",newTotalPrice);

             }else{
                newTotalPrice = Math.round(totalAmount -((coupenOffer/100)*totalAmount));
             }
        }else{
             if(totalAmount > redeemAmount){
               newTotalPrice = totalAmount - findedElement.offer;

             }else{
                 newTotalPrice = totalAmount- findedElement.offer;
             }
        }
        console.log("new price with coupen offer is :", newTotalPrice);
        res.status(200).json({success:true,newTotalAmount:newTotalPrice,cartDetails});
    }
  }catch(error){
    console.error("error occured while adding coupen from serverside",error);
    next(error);
  }
}

//dummy select
exports.dmyselect = async(req,res,next)=>{
  try{
     console.log("welcome to dmmy slect");
     const orderId = req.body.orderId;
     const productId = req.body.prodId;
     res.status(200).json({success:true,message:"successfull",orderId,productId});
  }catch(error){
    console.log("error while getting dym select ".error);
    next(error)
  }
}

//get selectedOrder 
exports.selectedOrders = async(req,res,next)=>{
  try{
    const oredrId = req.query.orderId;
    const productId = req.query.productId;
    const newPid = new mongoose.Types.ObjectId(productId);
    const newId = new mongoose.Types.ObjectId(oredrId );
    console.log("orderId for selected product is ",newId);
    const selectedOrder = await orderModel.aggregate([
      {
        $match:{
          "_id":newId
        }
      },
      {
         $unwind:"$products"
      },
      {
        $lookup:{
          from:"products",
          localField:"products.productId",
          foreignField:"_id",
          as:"productDetails"
        }
      },{
        $lookup: {
          from: "users",
          let: { 'currentAddress': '$currentAddress' },
          pipeline: [
            {
              $unwind: '$address'
            },
            {
              $match: { $expr: { $eq: [ '$address._id', '$$currentAddress' ] } }
            }
          ],
          as: "currentAddressDetail"
       }
      },{
        $match:{
            "productDetails._id":newPid
        }
      }
    ])
    console.log("selected order is :",selectedOrder);

    res.render('selectedOrder',{selectedOrder});
  

  }catch(error){
    console.log("eror occured while getting orders!",error);
    next(error);
  }
}

//invoice download
exports.invoiceDownload = async(req,res,next)=>{
  try{
    const {selectedOrder,price} = req.body;
    const id = selectedOrder[0]._id;
    console.log("selected order",selectedOrder);
    const data = {
      documentTitle: "Invoice",
      currency: "INR",
      marginTop: 25,
      marginRight: 25,
      marginLeft: 25,
      marginBottom: 25,
      sender: {
        company: "BoysWorld",
        address: "123 Main Road, Pathanamthitta, Kerala,India",
        zip: "651323",
        city: "Pathanamthitta,Kerala,India",
        country: "INV_ID:"+id,
        phone: "9876543210",
        email: "mensfashion@gmail.com",
        website: "www.mensfashion.shop",
      },
      invoiceNumber: `INV-${selectedOrder[0]._id}`,
      invoiceDate: new Date().toJSON(),
      products: selectedOrder.map((item) => ({
        quantity:item.products.quantity,
        description: item.productDetails[0].name,
        price: price,
      })),
      tax:0,
      total: `$ ${selectedOrder[0].totalAmount}`,
      bottomNotice: "Thank you for shopping at Boys World!",
    };
    
  console.log("before:",data);
  const result = await easyinvoice.createInvoice(data);
  
  res.status(200).json({success:true,file:result.pdf});

  }catch(error){
    console.log("error occured while downloading the invoice from the serverside ",error);
    next(error);
  }
}