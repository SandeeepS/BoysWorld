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

module.exports = {
    isUser,user
}