const coupenModel   = require('../../models/coupenModel');
const {default : mongoose} = require('mongoose');
const { format } = require('date-fns');


exports.getCoupen = async(req,res,next)=>{
    try{
        console.log("hello isdie the coupen");
        const coupenDetails = await coupenModel.find({"isDelete":false});
        console.log("coupen details :",coupenDetails);
        res.render('adminpanel/coupen',{coupenDetails});
    }catch(error){
        console.log("error while getting coupen page!!",error);
        next(error);
    }
}


//adding coupen
exports.addingCoupen = async(req,res,next)=>{
    try{
      const coupen2 = req.body;
      const offer = req.body;
      const  offer2 = offer.offer;
      console.log("offer:",offer2);
      const coupen = coupen2.coupen2;
      const {minCartAmount,redeemAmount,expDate,couponType} = req.body;
      console.log("expiry date:",expDate);
      console.log("heeee",redeemAmount,couponType,expDate)
      console.log("coupen from form ",coupen);
      const coupenData = await coupenModel.find();
      console.log("coupen details :",coupenData);
      const newCoupen =  new coupenModel({
            offerType :couponType,
            code:coupen,
            offer:offer2,
            minCartAmount,
            maxReedeemableAmount: redeemAmount,
            expiryDate:expDate
      })
      await newCoupen.save();
      console.log("new coupen :",newCoupen);
      res.redirect('/admin/coupen');
    }catch(error){
        console.error("error while adding coupen code!",error);
        next(error);
    }
}



//edit coupen
exports.editCoupen = async(req,res,next)=>{
    try{
        const coupenId = req.query.id;
        const id = new mongoose.Types.ObjectId(coupenId);
        const selectedCoupen = await coupenModel.findById(id);
        console.log("selected coupen:",selectedCoupen);        
        res.render('adminpanel/editCoupen',{selectedCoupen});
    }catch(error){
        console.error("error while editing the coupen!",error);
        next(error);
    }
}


//listUnlistCoupen
exports.listUnlistCoupen = async(req,res,next) =>{
    try{
         console.log("inside the changing the listinf ");
         res.redirect('/admin/coupen');
    }catch(error){
        console.error("error while change listed coupen !!",error);
        next(error);
    }
}


//updateEditedCoupen
exports.updateEditedCoupen = async(req,res,next) =>{
    try{
        console.log("req.body",req.body);
        const {coupen, coupenOffer,selectedCoupen,couponType,minCartAmount,redeemAmount,expDate} = req.body;
        const id = selectedCoupen._id;
        const updatingCoupen =  await coupenModel.findByIdAndUpdate(
            {"_id":id},
            {$set:{"offerType":couponType,"code":coupen,"offer":coupenOffer,"minCartAmount":minCartAmount,"maxReedeemableAmount":redeemAmount,"expiryDate":expDate}});
        res.status(200).json({success:true,message:"updatedSuccessfull"});
    }catch(error){
        console.log("error occured while updating the edited coupen:",error);
        next(error);
    }
}


//listUnlist
exports.listUnlist = async(req,res,next)=>{
    try{
        const {coupenId} = req.body;
        console.log("coupenId:",coupenId);
        const coupenId2 = new mongoose.Types.ObjectId(coupenId);
        const coupenData = await coupenModel.findById(coupenId);
        const currentListedStatus = coupenData.listed;
        console.log("currentListedStatus:",currentListedStatus);

        if(currentListedStatus == true){
            const updatedCoupen = await coupenModel.findByIdAndUpdate({"_id":coupenId2},{$set:{"listed":false}});
        }else{
            const updatedCoupen = await coupenModel.findByIdAndUpdate({"_id":coupenId2},{$set:{"listed":true}});
        }
        res.status(200).json({success:true});
    }catch(error){
        console.error("error while listing the coupen!!",error);
        next(error);
    }
}


//coupen delete
exports.coupenDelete = async(req,res,next)=>{
    try{
        const coupenId = req.body.coupenId;
        const coupenId2 = new mongoose.Types.ObjectId(coupenId);
        console.log("coupenId2:",coupenId2);
        const updatedCoupen = await coupenModel.findByIdAndUpdate({"_id":coupenId2},{$set:{"isDelete":true}})
        res.status(200).json({success:true});
    }catch(error){
        console.error("error while deleting the coupen!!",error);
        next(error);
    }
}



