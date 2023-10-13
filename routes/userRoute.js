const express = require('express');
const route = express();
const userController = require('../controllers/userController');
const auth = require('../middleware/middlewares');



//user routes
route.get('/',userController.home);
route.get('/login',auth.isUser,userController.loginPage);
route.get('/signup',auth.isUser,userController.signupPage);
route.get('/shop',auth.user,userController.shopPage);
route.get('/contact',auth.user,userController.contactPage);
route.get('/selectedProduct/:id',auth.user,userController.selectedProduct)
route.get('/getOtpPage',auth.isUser,userController.getOtpPage);


//varifying otp
route.post('/verifyOtp',auth.isUser,userController.verifyOtp);
route.post('/resendOTP',userController.resendOTP);


route.post('/loginUser',auth.isUser,userController.userEntry);
route.post('/logout',userController.logout);


route.post('/signupUser',userController.signup)

//cartegoty
// route.get('/category',userController);

route.get('/sportswear',userController.sportsWear);

//route for navbar
route.get('/getAccount',auth.user,userController.getAccount);
route.get('/getWishlist',auth.user,userController.getWishlist);
route.get('/getCheckout',auth.user,userController.getCheckout);
route.get('/getCart',auth.user,userController.getCart);
route.get('/addToCart/:id',userController.addToCart);
route.get('/cartItemDelete/:id',userController.cartItemDelete);

route.get('/addAddress',userController.addAddressPage);
route.post('/address',userController.address);
route.get('/showAddress',userController.showAddress);


module.exports = route
