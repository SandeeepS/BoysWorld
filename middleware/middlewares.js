/**middleware for user */

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
        res.redirect('/dashboard');
    }
    else{
        return next();
    }
}


module.exports = {
    isUser,user,admin
}