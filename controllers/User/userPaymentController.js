
const UserModel = require('../../models/userModel');
const orderModel = require('../../models/ordersModel');
const Razorpay = require('razorpay');
const { format } = require('date-fns');
const { default: mongoose } = require('mongoose');
const productModel = require('../../models/productModel');
const { error } = require('jquery');
const {RAZORPAY_ID_KEY,RAZORPAY_SECRET_KEY} = process.env;

var instance = new Razorpay({
  key_id: RAZORPAY_ID_KEY,
  key_secret: RAZORPAY_SECRET_KEY,
});

//place order 
exports.placeOrder = async (req, res,next) => {
    try {
      const { cartDetails,totalAmount,coupen} = req.body;
      console.log("coupen in server side from place order :",coupen);
      const user = req.session.user;
      const userid = new mongoose.Types.ObjectId(user);
  
      const currentUserDetail = await UserModel.find({"_id":userid});
      console.log("currentuserDetails:",currentUserDetail);
      //if the currentUserDetails not containing any coupens 
      let iscoupenExist = undefined;
       if (currentUserDetail.usedCoupen ){
          iscoupenExist = currentUserDetail.usedCoupen.find((ele)=> ele == coupen);
       } 
      console.log("iscoupen exist:",iscoupenExist);
      if(coupen != undefined && iscoupenExist != undefined){
         res.status(200).json({success:true,message:"Coupen code Expired ! Please remove it"});
      } else{
  
        console.log(cartDetails);
        const cashOnDelivery = "cashOnDelivery";
        const status = "Conformed";
        const userId = cartDetails[0]._id;
        const date = new Date();
        const formattedDate = format(date, 'dd/MM/yyyy HH:mm:ss');     
        const randomId = 10000+Math.floor(Math.random()*90000);
        const currentAddress = cartDetails[0].currentAddress;
        const total = cartDetails[0].cart.total;//need to fix it again
        const usedCoupen = coupen;
        console.log("usedCoupen is :0",usedCoupen);
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
            "usedCoupen":usedCoupen
           
        })
        const savedData = await order.save();
        if(coupen != undefined){
          const updatedUser = await UserModel.findByIdAndUpdate({"_id":user},{$push:{"usedCoupen":coupen}});
        }
        // Respond with a success message
        res.status(200).json({ success: true, message: 'Order placed successfully.' });
      }
  
    } catch (error) {
      console.error('Error placing order:', error);
      next(error);
    }
  };
  

  
exports.placeOrder2 = async(req,res,next)=>{
    try{
      const {productId,quantity,total,currentAddress,currentAddressId,size,coupen} = req.body;
      console.log("coupen in serverside :",coupen);
      const userId2 = req.session.user;
      const user = await UserModel.findById(userId2).exec();
      const iscoupenExist = user.usedCoupen.find((ele)=> ele == coupen);
      if(coupen != undefined && iscoupenExist != undefined){
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
                  const usedCoupen = coupen;
                  const order = new orderModel({
                    "userId":userId,
                    "products":productId2,
                    "orderId":randomId,
                    "currentAddress":currentAddressId,
                    "totalAmount":total,
                    "date": formattedDate,
                    "paymentMethod":cashOnDelivery,
                    "currentStatus":status,
                    "usedCoupen":usedCoupen
                    
            
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
                  const updatedUser = await UserModel.findByIdAndUpdate({"_id":userId2},{$push:{"usedCoupen":coupen}});
                }
                console.log("order inserted successfully");
                res.status(200).json({ success: true,});
      }
  
    }catch(err){
      console.error("error in place order 2 ",err);
      next(error);
    }
  }



  //online payment through razorpay
exports.generateRazorpay = async(req,res,next)=>{
    try{
       const {productId, quantity, total,currentAddress,currentAddressId,size,coupen} = req.body;
       console.log("coupen from online payment:",coupen);
       const onlinePayment = "Online Payment";
       const status = "pending";
       const userid = req.session.user;
       const user = await UserModel.findById(userid);
       const iscoupenExist = user.usedCoupen.find((ele)=> ele == coupen);
       if(coupen != undefined && iscoupenExist != undefined){
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
         const usedCoupen = coupen;  
             const orders = new orderModel({
               "userId":userId,
               "products":productId2,
               "orderId":randomId,
               "totalAmount":total,
               "currentAddress":currentAddressId,
               "date":formattedDate,
               "paymentMethod":onlinePayment,
               "currentStatus":status,
               "usedCoupen":usedCoupen
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
           if(coupen != undefined){
             const updatedUser = await UserModel.findByIdAndUpdate({"_id":userid},{$push:{"usedCoupen":coupen}});
           }
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
     next(error);
    }
}


//razorpay payment from checkout2 page
exports.generateRazorpayFromCheckout2 = async(req,res,next)=>{
    try{
      const { cartDetails,totalAmount,currentAddressId,size,coupen} = req.body;
      console.log(cartDetails);
      console.log("coupen from generate reazorpay 2",coupen);
      const userid = req.session.user;
      const user = await UserModel.findById(userid);
      //if the user have no coupen
      let iscoupenExist = undefined;
      if(user.usedCoupen){
        iscoupenExist = user.usedCoupen.find((ele)=> ele == coupen);
      }
      if(coupen != undefined && iscoupenExist != undefined){
          res.status(200).json({success:true,message:"Coupen code Expired! ! Please remove it"});
  
      }else{
  
                const cashOnDelivery = "Online Payment";
                const status = "Pending";
                const userId = cartDetails[0]._id;
                const date = new Date();
                const formattedDate = format(date, 'dd/MM/yyyy HH:mm:ss');     
                const randomId = 10000+Math.floor(Math.random()*90000);
                const currentAddress = cartDetails[0].currentAddress;
                const total = totalAmount;
                const usedCoupen = coupen;
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
                    "usedCoupen":usedCoupen
                })
                const savedData = await neworder.save();
                if(coupen != undefined){
                  const updatedUser = await UserModel.findByIdAndUpdate({"_id":userid},{$push:{"usedCoupen":coupen}});
                }
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
            }
    }catch(error){
      console.error("error in the razorpay implimentaion route from checkout2",error);
      next(error);
    }
  }


  //verify payment
exports.verifyPayment = async(req,res,next)=>{
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
      next(error);
    }
  }


  //varify payment 2 
exports.verifyPayment2 = async(req,res,next)=>{
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
      next(error);
    }
  }


  //wallet1 
exports.wallet1 = async(req,res,next)=>{
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
               const usedCoupen = coupen;
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
                       "usedCoupen":usedCoupen
                       
               
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
                   console.log("newWallet amount",newWalletAmount);
 
                    const updatedWallet = await UserModel.findByIdAndUpdate({"_id":userId},{$set:{"wallet":newWalletAmount}});
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
     next(error);
    }
 }

 
//wallet2
exports.wallet2 = async(req,res,next)=>{
    try{
         const { cartDetails,totalAmount,coupen} = req.body;
 
         console.log(cartDetails);
         console.log("coupen wallet2 :",coupen);
 
         const user = req.session.user;
        const userId = new mongoose.Types.ObjectId(user);
        const userDetails = await UserModel.findById(userId);
        const iscoupenExist = userDetails.usedCoupen.find((ele)=> ele == coupen);
 
        if( coupen !== undefined && iscoupenExist != undefined){
            res.status(200).json({success:true,message:"Coupen code Expired! ! Please remove it"});
    
        }else{
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
                     const usedCoupen = coupen;
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
                         "usedCoupen":usedCoupen
                     })
                     const savedData = await order.save();
         
                     if(coupen != undefined){
                       const updatedUser = await UserModel.findByIdAndUpdate({"_id":user},{$push:{"usedCoupen":coupen}});
                     }
   
                     let newWalletAmount = walletAmount - total; 
                     console.log("newWallet amount",newWalletAmount);
   
                      const updatedWallet = await UserModel.findByIdAndUpdate({"_id":userId},{$set:{"wallet":newWalletAmount}});
                     // Respond with a success message
                     res.status(200).json({ success: true, message: 'Order placed successfully.' });
               }else{
                   res.status(200).json({success:true,message:"Your Wallet amount is insufficient for this Order\n Please try another Payment Method"})
               }
       }
    }catch(error){
      console.log("error occured in the wallet payment in wallet 2!!",error);
      next(error);
    }
 }
 
