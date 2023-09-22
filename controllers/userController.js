exports.home = async(req,res)=>{
    res.render("index");

}

exports.loginPage = async(req,res)=>{
    res.render("login");
}

exports.signupPage = async(req,res)=>{
    res.render('signup');
}

exports.shopPage = async(req,res)=>{
    res.render('shop');
}

exports.contactPage = async(req,res)=>{
    res.render('contact');
}