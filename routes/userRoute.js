const express = require('express');
const route = express();
const userController = require('../controllers/userController');
const auth = require('../middleware/middlewares');



//user routes
route.get('/',userController.home);
route.get('/login',auth.isUser,userController.loginPage);
route.get('/signup',auth.isUser,userController.signupPage);
route.get('/shop',auth.user,userController.shopPage);   
route.post('/categoryBasedProduct',userController.categoryBasedProduct);

route.get('/contact',auth.user,userController.contactPage);
route.get('/selectedProduct/:id',auth.user,userController.selectedProduct)
route.get('/getOtpPage',auth.isUser,userController.getOtpPage);
route.get('/getCheckout',auth.user,userController.getCheckoutPage);
route.get('/getCheckout2',auth.user,userController.getCheckoutPage2);



//varifying otp
route.post('/verifyOtp',auth.isUser,userController.verifyOtp);
route.post('/resendOTP',userController.resendOTP);

route.post('/sendResetOtpmail',userController.sendResetOtpmail);
route.post('/conformOTPResetPassword',userController.conformOTPResetPassword);
route.post('/resetPasswordLogin',userController.resetPasswordLogin);


route.post('/loginUser',auth.isUser,userController.userEntry);
route.post('/reSendotpResetPassword',userController.reSendotpResetPassword)
route.post('/logout',userController.logout);


route.post('/signupUser',userController.signup);

route.post('/placeOrder',auth.user,userController.placeOrder);
route.post('/placeOrder2',auth.user,userController.placeOrder2);
route.post('/generateRazorpay',auth.user,userController.generateRazorpay);
route.post('/verify-payment',auth.user,userController.verifyPayment);

route.post('/updateProfileDetails',auth.user,userController.updateProfileDetails);
route.post('/changePassword',auth.user,userController.changePassword);

//cartegoty
// route.get('/category',userController);

route.get('/sportswear',auth.user,userController.sportsWear);

//route for navbar
route.get('/getAccount',auth.user,userController.getAccount);
route.get('/getWishlist',auth.user,userController.getWishlist);
route.get('/getCart',auth.user,userController.getCart);
route.post('/update-quantity',userController.updateQuantity);
route.get('/addToCart/:id',userController.addToCart);
route.get('/cartItemDelete/:id',userController.cartItemDelete);
route.get('/addAddress',auth.user,userController.addAddressPage);
route.post('/saveAddress',userController.saveAddress);
route.post('/address',userController.address);
route.get('/showAddress',userController.showAddress);
route.get('/addressDelete/:id',userController.addressDelete);
route.get('/setDefaultAddress/:id',userController.setDefaultAddress);
route.get('/setDefaultAddressFromCheckout/:id',userController.setDefaultAddressFromCheckouts);
route.get('/orders',userController.oders);
route.post('/cancelOrder',userController.cancelOrder);


module.exports = route
