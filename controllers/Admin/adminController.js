const userModel = require('../../models/userModel');
const adModel = require('../../models/adminModel');
const productModel = require('../../models/productModel');
const categoryModel = require('../../models/categoryModel');
const orderModel = require('../../models/ordersModel');
const { default: mongoose } = require('mongoose');
const moment = require('moment');
const { format } = require('date-fns');
const fs = require('fs');
const json2csv = require('json2csv').parse;


exports.adminlogin = async(req,res)=>{
    if(req.session.admin){
        res.redirect('/admin/dashboard');
    }else{
        const message = "Admin Login";
        res.render('adminpanel/login',{message});
    }
}

exports.getHomePage = async(req,res)=>{
    try{
        const currentDate = new Date();
        const formattedDate = format(currentDate, 'dd/MM/yyyy'); 
        console.log("formattedDate :",formattedDate);
        const currentOrders = await orderModel.aggregate([
            {
                $addFields: {
                    convertedDate: {
                        $substr: ["$date", 0, 10]
                    }
                }
            },
            {
                $match:{
                    convertedDate:{$eq:formattedDate}
                }
            },
            {
                $unwind:"$products"

            },{
                $lookup:{
                    from:'users',
                    localField: 'userId',
                    foreignField:'_id',
                    as:"userDetails"
                }
            },{
                $lookup:{
                    from:'products',
                    localField:'products.productId',
                    foreignField:'_id',
                    as:"productDetails"
                   }
            },{
                $lookup:{
                    from:'categories',
                    localField:'productDetails.category',
                    foreignField:'_id',
                    as:"productCategory",
                   }
            }
        ])
        console.log("currentOrders:",currentOrders);
        const currentOrderCount = currentOrders.length;
        const products = await productModel.find({});
        const category = await categoryModel.find({});
        const users = await userModel.find({});
        let uniqueProductIds = new Set(products.map(product => product._id));
        let uniqueProductIdsArray = [...uniqueProductIds];
        const uniqueProducts = await productModel.find({_id:{$in:uniqueProductIdsArray}});
        console.log("uniqueProducts:",uniqueProducts);
        const shirtsOrders = currentOrders.filter(cat => cat.productCategory[0].name === 'Shirt')
        const pantsOrders = currentOrders.filter(cat => cat.productCategory[0].name === 'Pant')
        const tShirtOrders = currentOrders.filter(cat => cat.productCategory[0].name === 'T-shirt');

        const shirtOrderCount = shirtsOrders.length;
        const pantsOrdersCount = pantsOrders.length;
        const tShirtOrdersCount = tShirtOrders.length;

        res.render('adminpanel/index',{shirtOrderCount,pantsOrdersCount,tShirtOrdersCount,uniqueProducts,products,category,users,currentOrderCount});
    }catch(error){
        console.error("error while getting the admin dashboard !!",error);
    }
   
}

exports.getDashboard = async(req,res)=>{
    const {email,adPassword} = req.body;
    console.log(email);
    console.log(adPassword);
    try{
        const admin = await adModel.findOne({email:email,pass:adPassword}).exec();
        console.log("admin found in the database :",admin);

        if(admin){
            req.session.admin = admin.name;
            console.log(req.session.admin);
            res.redirect('/admin/dashboard');
        }else{
            const message = "incorrect Password or Email";
            res.render('adminpanel/login',{message});
        }
    }catch(error){
        console.error("error during login:",error);
        res.redirect('/');
    }
}

exports.getCustomer = async(req,res)=>{
    try{
        const page = req.query.page || 1;
        const currentPage = parseInt(page);
        console.log("current page:",currentPage);
        const itemsPerPage = 5;
        const skip = (page - 1) * itemsPerPage;
        const totalCount = await userModel.countDocuments({isDeleted:false}).exec();
        console.log("totalcount:",totalCount);
        const totalPages = Math.floor(totalCount/itemsPerPage);
        console.log("totalpages:",totalPages);
        const usersData = await userModel
                    .find()
                    .skip(skip)
                    .limit(itemsPerPage)
                    .exec();
        res.render('adminpanel/customers',{users:usersData,totalPages,currentPage,totalCount});
    }catch(error){
        console.error("error while fetching users",error);
    }
}



exports.getOrders = async(req,res)=>{
    try{
        const  orderStatus = ["Shipped","Out for Delivery","Deliverd"];
        const page = req.query.page || 1;
        const currentPage = parseInt(page);
        console.log("current page:",currentPage);
        const itemsPerPage = 8;
        const skip = (page - 1) * itemsPerPage;
        const totalCount = await orderModel.countDocuments({}).exec();
        console.log("totalcount:",totalCount);
        const totalPages = Math.floor(totalCount/itemsPerPage);
        console.log("totalpages:",totalPages);
        const products = await productModel.find().exec();
        const oders = await orderModel.aggregate([
            {
                $unwind: "$products" 
            },
            {
                $lookup:{
                    from:'users',
                    localField: 'userId',
                    foreignField:'_id',
                    as:"userDetails"
                }
            },
            {
               $lookup:{
                from:'products',
                localField:'products.productId',
                foreignField:'_id',
                as:"productDetails"
               }
            },
            {
                $sort:{
                    _id:-1
                }
            },
            {
                $skip:skip
            },
            {
                $limit:itemsPerPage
            },
          
        ]);
       
        console.log("oders:",oders);
        console.log("productdetails :",oders.productDetails);
        res.render('adminpanel/orders',{oders,products,orderStatus,totalPages,currentPage,totalCount});
    }catch(err){
        console.error("error while getting the orders list  page",err);
    }
}


exports.getBanner = async(req,res)=>{
    res.render('adminpanel/banner');
}

//getting sales report
exports.getSalesReport = async(req,res) => {

    try{
        if(req.query.date){
            const inputDate = req.query.date;
            const dateParts = inputDate.split("/");
            const reversedDatePart = dateParts.reverse();
            const year = reversedDatePart[0];
            const remainingDatePart = reversedDatePart.splice(1,2);
            const newDate = remainingDatePart.concat(year);
            const reformattedDate = newDate.join("/");
            console.log("reformattedDate",reformattedDate);
            console.log(typeof(inputDate));
            console.log("date from server:",reformattedDate );
            const orders = await orderModel.aggregate([
                {
                    $addFields: {
                        convertedDate: {
                           $substr: ["$date", 0, 10]
                        }
                     }
                },
                {
                    $match:{
                        convertedDate:reformattedDate

                    }
                },
                {
                    $unwind:"$products"
                },
                {
                    $lookup:{
                        from:'users',
                        localField: 'userId',
                        foreignField:'_id',
                        as:"userDetails"
                    }
                },{
                    $lookup:{
                        from:'products',
                        localField:'products.productId',
                        foreignField:'_id',
                        as:"productDetails"
                       }
                }
            ]);

            const simplifiedOrders = orders.map(order => ({
                userId: order.userId,
                productId: order.products.productId,
                date: order.convertedDate,
                orderId: order._id,
                price: order.products.price,
                addressId: order.currentAddress,
                
            }));
            console.log("orders from get sales report:",orders);
            console.log("simplifed orders:",simplifiedOrders);
            res.render('adminpanel/salesReport',{orders,simplifiedOrders});
        } else if(req.query.firstDate && req.query.secondDate){

            const firstInputDate = req.query.firstDate;
            const secondInputDate = req.query.secondDate;

            const firstInputDateParts = firstInputDate.split("/");
            const secondInputDateParts = secondInputDate.split("/");

            const reversedFirstDate = firstInputDateParts.reverse();
            const reversedSecondDate = secondInputDateParts.reverse();

            const yearFromFrist = reversedFirstDate[0];
            const yearFromSecond = reversedSecondDate[0];

            const remainingDatePartFrist = reversedFirstDate.splice(1,2);
            const remainingDatePartSecond = reversedSecondDate.splice(1,2);

            const newFirstDate = remainingDatePartFrist.concat(yearFromFrist);
            const newSecondDate = remainingDatePartSecond.concat(yearFromSecond);

            const reformattedDateFirst = newFirstDate.join("/");
            const reformattedDateSecond = newSecondDate.join("/");

            console.log("d1:",reformattedDateFirst);
            console.log("d2:",reformattedDateSecond);

            const isoDateFirst = moment(reformattedDateFirst, 'DD-MM-YYYY').format();
            const isoDateSecond = moment(reformattedDateSecond, 'DD-MM-YYYY').format();

            const orders = await orderModel.aggregate([
                {
                    $addFields: {
                        convertedDate: {
                           $substr: ["$date", 0, 10]
                        }
                     }
                },
            
                {
                    $match: {
                        convertedDate: {
                          $gte: reformattedDateFirst,
                          $lte: reformattedDateSecond
                        }
                      }
                },
                {
                    $unwind:"$products"
                },
                {
                    $lookup:{
                        from:'users',
                        localField: 'userId',
                        foreignField:'_id',
                        as:"userDetails"
                    }
                },{
                    $lookup:{
                        from:'products',
                        localField:'products.productId',
                        foreignField:'_id',
                        as:"productDetails"
                       }
                }
            ]);
            const simplifiedOrders = orders.map(order => ({
                userId: order.userId,
                productId: order.products.productId,
                date: order.convertedDate,
                orderId: order._id,
                price: order.products.price,
                addressId: order.currentAddress,
               
            }));

            console.log("orders from get sales report according to dates:",orders);
            res.render('adminpanel/salesReport',{orders,simplifiedOrders});
        }else if(req.query.year){
              const year  = req.query.year;
              console.log("year:",year);
              const orders = await orderModel.aggregate([
                {
                    $addFields: {
                        convertedDate: {
                           $substr: ["$date", 6, 4]
                        }
                     }
                },
                {
                    $match: {
                        convertedDate: year
                      }
                },
                {
                    $unwind:"$products"
                },
                {
                    $lookup:{
                        from:'users',
                        localField: 'userId',
                        foreignField:'_id',
                        as:"userDetails"
                    }
                },{
                    $lookup:{
                        from:'products',
                        localField:'products.productId',
                        foreignField:'_id',
                        as:"productDetails"
                       }
                }
            ]);
            const simplifiedOrders = orders.map(order => ({
                userId: order.userId,
                productId: order.products.productId,
                date: order.convertedDate,
                orderId: order._id,
                price: order.products.price,
                addressId: order.currentAddress,
             
            }));

            console.log("orders from get sales report according to year:",orders);
            res.render('adminpanel/salesReport',{orders,simplifiedOrders});
              
        }
        else{
            const simplifiedOrders = "";
            const orders = "";
            res.render('adminpanel/salesReport',{orders,simplifiedOrders});
        }
     

    }catch(error){
         console.error("error while getting sales report!",error);
    }
}

//download sales report
exports.downloadSalesReport = async(req,res)=>{
    try{
        
        
        
        const {orders} = req.body;
        console.log("orders from download:",orders);
        // Define the headers

        // Convert JSON to CSV
        const csv = json2csv(orders);

        // Write the CSV data to a file
        fs.writeFileSync('salesReport.csv', csv);

        // Read the file data
        const fileData = fs.readFileSync('salesReport.csv');

        // Convert the file data to Base64
        const base64String = fileData.toString('base64');
        res.download('base64String');
        // Send the file data as a response
        res.status(200).json({success:true,message:"successful",file:base64String});

    } catch(error) {
        console.error("error while downloading the sales report",error);
    }
}

//add product
exports.addProduct = async(req,res)=>{
    try{
        const categoryData = await categoryModel.find({isDelete:false}).exec();
        res.render('adminpanel/addProduct',{category:categoryData});
    }catch(err){
        console.error("error loading catogories",err);
    }
    
}

//add coupen page
exports.addCoupenPage = async(req,res)=>{
    try{

        res.render('adminpanel/addCoupen');

    }catch(error){
        console.error("error while getting addcoupen page!!",error);

    }
}



//updateStatus
exports.updateStatus = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await userModel.findById(userId).exec();
       console.log(user.name);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        console.log(user.name);
        if(user.status == true){
            user.status = false;
        }else{
            user.status = true;
        }

       

        await user.save(); 
         res.json({ success: true, message: "User status updated and session destroyed" });

    } catch (err) {
        console.error("Error updating status:", err);
        res.redirect('/admin/customers');
    }
}

//update order status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { newStatus, orderId } = req.body;
        const userId = req.session.user;
        const orderToUpdate = await orderModel.updateOne({_id:orderId},{$set:{"currentStatus":newStatus}}).exec();
        res.status(200).json({success:true,message:"status updated succesfully",newStatus,orderId});
    } catch (err) {
        console.error("Error while updating the status on the server side ", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

//cancel order
exports.cancelOrder = async(req,res)=>{
    try{
        const orderId = req.body.orderId;
        const orderId2 = new mongoose.Types.ObjectId(orderId);
        const updatedOrder = await orderModel.findOneAndUpdate({"_id":orderId2},{$set:{"currentStatus":"Cancelled"}});
        console.log("orderId:",orderId);
        res.status(200).json({success:true,message:"orderStatus updated successfully"})
    }catch(error){
        console.log("error occured while cancellig the order from the admin side",error);
    }
}












//logout
exports.logout = async(req,res)=>{
    req.session.destroy((err)=>{
        if(err){
            console.error("Error destroying session",err);
        }else{
            res.redirect('/admin');
        }
    });
}
