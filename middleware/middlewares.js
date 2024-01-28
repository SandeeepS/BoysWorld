/**middleware for user */

const moment = require('moment');
const userModel = require('../models/userModel');

async  function isUser(req,res,next){
    const userId = req.session.user;
    const userDetails = await userModel.findById(userId);
    if(req.session.user && userDetails.status == true ){
        res.redirect('/shop');
    }else{
        return next();
    }
}

async function user(req,res,next){
    if(!req.session.user){
        res.redirect('/login');
    }else{
        const userId = req.session.user;
        console.log("userId:",userId);
        const userDetails = await userModel.findById(userId);
        console.log("userdetails is :",userDetails);
        if(req.session.user && userDetails.status == true){
            return next();
        }else{
            res.redirect('/login');
        }
   
    }

}

function admin(req,res,next){
    if(req.session.admin){
        res.redirect('/admin/dashboard');
    }
    else{
        return next();
    }
}
function isAdmin(req,res,next){
    if(!req.session.admin){
         res.redirect('/admin');
    }else{
        return next();
    }
}



module.exports = {
    isUser,user,admin,isAdmin,
}