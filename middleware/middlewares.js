/**middleware for user */

const moment = require('moment');

function isUser(req,res,next){
    if(req.session.user){
        res.redirect('/shop');
    }else{
        return next();
    }
}

function user(req,res,next){
    if(!req.session.user){
        res.redirect('/login');
    }else{
        return next();


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