



const UserModel = require('../models/userModel');

const otpGenerator = require('otp-generator');
const nodemailer = require('nodemailer');
const bcrypt  = require('bcrypt');
const moment =  require('moment');
const Razorpay = require('razorpay');
const { v4: uuidv4 } = require('uuid');

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
const crypto = require('crypto');
const { log } = require('console');


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
        const productData = await productModel.find({isDeleted:false}).exec();
        const categoryData = await categoryModel.find({isDelete:false}).exec();
      
        res.render('shop',{product:productData,category:categoryData});

     
    }catch(error){
        console.error("error while fetching products",error);
        res.redirect('/');
    }
   
}

//get product by category
exports.getProductsByCategory = async(req,res)=>{
  try{
    const selectedCategory = req.query.category;
    console.log(selectedCategory);
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


//resendOTP
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
          const message = "otp resended ";
          res.render('otp',{message});
        }
      });
    } catch (error) {
      console.error("Error resending OTP:", error);
      res.status(500).json({ message: 'error!!!!' });
    }
    
}


//varify otp

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
    const currentAddress = userData.currentAddress;
    const oders = userData.oders;
    const productId = req.query.productId;
    const quantity = req.query.quantity;
    const product = await productModel.findById(productId).exec();
    const totalPrice = product.price * quantity;
    res.render('checkout',{address,currentAddress,product,quantity,totalPrice,oders});
    

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
    const addressObjectId = new ObjectId(addressId).toString();
    const user = await UserModel.findById(userId).exec();

    if (user) {
      let currentAddressIndex = user.address.findIndex((add) => add.id === addressObjectId);
      console.log(currentAddressIndex);
      if (currentAddressIndex !== -1) { 
        const currentAddress = user.address[currentAddressIndex]; 
        user.currentAddress.splice(0, 1, currentAddress);
        await user.save();
      } else {
        console.log("Address not found.");
      }
    }

    res.redirect('/getCheckout');
  } catch (err) {
    console.error("Error while updating the default address", err);
    res.redirect('/getCheckout');
  }
}


//place order 

//place order 
exports.placeOrder = async (req, res) => {
  try {
    const { productId, quantity, total,currentAddress } = req.body;
    const cashOnDelivery = "cashOnDelivery";
    const status = "Conformed";
    const userId = req.session.user;
    console.log(quantity);
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Insert the order into the user's document
  const userdata = await UserModel.findByIdAndUpdate(userId,{
    $push:{
      oders:{
        "productId":productId,
        "quantity":quantity,
        "price":total,
        "currentAddress":currentAddress,
        "paymentMethod": cashOnDelivery,
        "status":status,
      }
    }
  },{new:true})

    // Respond with a success message
    res.status(200).json({ success: true, message: 'Order placed successfully.' });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

//online payment through razorpay
exports.generateRazorpay = async(req,res)=>{
     try{
        const {productId, quantity, total,currentAddress} = req.body;
        const onlinePayment = "Online Payment";
        const status = "Pending";
        const userId = req.session.user;
        // Insert the order into the user's document
        const userdata = await UserModel.findByIdAndUpdate(userId,{
          $push:{
            oders:{
              "productId":productId,
              "quantity":quantity,
              "price":total,
              "currentAddress":currentAddress,
              "paymentMethod": onlinePayment,
              "status":status,
            }
          }
        },{new:true})
        const user = await UserModel.findById(userId).exec();
        const order = user.oders;
        const currentOrder = order.find(orderItem => orderItem.productId === productId);
        const   orderId = JSON.stringify(currentOrder._id);
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
    const {payment,oders} = req.body;

    console.log(oders);
    console.log(payment);
  const status = "conformed";
    const userId = req.session.user;
    // Insert the order into the user's document
    const userdata = await UserModel.findByIdAndUpdate(userId,{
      $set:{
        oders:{
        
          "status":status,
        }
      }
    },{new:true})

  }catch(err){
    console.error("error while varifying the payment form server!",err)
    res.status(500).json({success:false, message:"internal server error"});
  }
}

//oders
exports.oders = async(req,res)=>{
  try{
    const userId = req.session.user;
    const productsInOrders = [];
    const user = await UserModel.findById(userId).exec();
    const oders = user.oders;
    console.log(oders);
    for(let i=0;i<oders.length;i++){
      productsInOrders.push(oders[i].productId);

    }
    console.log(productsInOrders);

    const products = await productModel.find({ _id: { $in: productsInOrders } }).exec();
    console.log(products);
    res.render('orders',{oders,products});

  }catch(err){
    console.error("error while getting oders");
    res.redirect('/getAccount');
  }
}


//cancel orders by user
exports.cancelOrder = async(req,res)=>{
  try{
        const {orderId} = req.body;
        const userId = req.session.user;
        const user = await UserModel.findById(userId).exec();
        await UserModel.findByIdAndUpdate(userId,{$pull:{oders:{_id:orderId}}}).exec();
        res.status(200).send({message:"order cancelled successfully"});
  }catch(err){
    console.error("error while canceling the order",err);
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

       }      
       
       if(isPasswordMatch == true && (hashedNewPassword == hashedConformPassword) ){
             user.pass = await bcrypt.hash(newPassword,saltRouds);
             await user.save();
             res.status(200).json({ success: true, message: 'Updated successfully.' });
       }else{
             res.status(200).json({success:true, message: 'Something went Wrong!!'});
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
      expirationTime: extime,
    };
    req.session.tempEmail = email;
    const user = await UserModel.findOne({ email: email});

    if (!user) {
      // Email not found in the database
      console.log("this email is not in the database");
      const count = 1;
      return res.status(400).json({ success: false, message: 'Email not registered. Please sign up.',count });
      
    }


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
    res.status(200).json({success: true,message:"otp send successfully",count})
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
    if(otp == realOtp){
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