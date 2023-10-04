const express = require('express');
const route = express();
const userController = require('../controllers/userController');
const auth = require('../middleware/middlewares');


//user routes
route.get('/',userController.home);
route.get('/login',auth.isUser,userController.loginPage);
route.get('/signup',userController.signupPage);
route.get('/shop',auth.user,userController.shopPage);
route.get('/contact',auth.user,userController.contactPage);
route.get('/otp',userController.getOtpPage);

//varifying otp
route.post('/verifyOtp',userController.verifyOtp);


route.post('/loginUser',userController.userEntry);
route.post('/logout',userController.logout);


route.post('/signup',userController.signup)

//cartegoty
// route.get('/category',userController);

route.get('/sportswear',userController.sportsWear);


//route for navbar
route.get('/getAccount',auth.user,userController.getAccount);
route.get('/getWishlist',auth.user,userController.getWishlist);
route.get('/getCheckout',auth.user,userController.getCheckout);
route.get('/getCart',auth.user,userController.getCart);


module.exports = route
