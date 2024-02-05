const express               =  require('express');
const route                 =  express();
const userController        =  require('../controllers/User/userController');
const userPaymentController =  require('../controllers/User/userPaymentController');
const auth                  =  require('../middleware/middlewares');

//usersignup
route.get('/signup',auth.isUser,userController.signupPage);
route.post('/signupUser',userController.signup);

//user login , logout ,reset password
route.get('/login',auth.isUser,userController.loginPage);
route.post('/loginUser',auth.isUser,userController.userEntry);
route.post('/reSendotpResetPassword',userController.reSendotpResetPassword)
route.post('/logout',userController.logout);

//get main pages
route.get('/',userController.home);
route.get('/shop',auth.user,userController.shopPage); 
route.get('/getShopWithPriceRange',auth.user,userController.getShopWithPriceRange);
route.get('/getShopBySearch',auth.user,userController.getShopBySearch);
route.get('/contact',auth.user,userController.contactPage);
route.get('/selectedProduct/:id',auth.user,userController.selectedProduct)
route.get('/getOtpPage',auth.isUser,userController.getOtpPage);
route.get('/getCheckout',auth.user,userController.getCheckoutPage);
route.get('/getCheckout2',auth.user,userController.getCheckoutPage2);
route.get('/orders',userController.oders);
route.get('/getAccount',auth.user,userController.getAccount);
route.get('/getWishlist',auth.user,userController.getWishlist);
route.get('/getCart',auth.user,userController.getCart);
route.get('/showWallet',auth.user,userController.showUserWallet);
route.post('/categoryBasedProduct',userController.categoryBasedProduct);

//payment routes
route.post('/placeOrder',auth.user,userPaymentController.placeOrder);
route.post('/placeOrder2',auth.user,userPaymentController.placeOrder2);
route.post('/generateRazorpay',auth.user,userPaymentController.generateRazorpay);
route.post('/generateRazorpayFromCheckout2',userPaymentController.generateRazorpayFromCheckout2)
route.post('/verify-payment',auth.user,userPaymentController.verifyPayment);
route.post('/verify-payment2',userPaymentController.verifyPayment2)
route.post('/wallet1',userPaymentController.wallet1);
route.post('/wallet2',userPaymentController.wallet2);

//varifying otp
route.post('/verifyOtp',auth.isUser,userController.verifyOtp);
route.post('/resendOTP',userController.resendOTP);

//varification email
route.post('/sendResetOtpmail',userController.sendResetOtpmail);
route.post('/conformOTPResetPassword',userController.conformOTPResetPassword);
route.post('/resetPasswordLogin',userController.resetPasswordLogin);

//gettig pages
route.get('/showAddress',userController.showAddress);
route.get('/setDefaultAddress/:id',userController.setDefaultAddress);
route.get('/setDefaultAddressFromCheckout',userController.setDefaultAddressFromCheckouts);
route.get('/setDefaultAddressFromCheckout2',userController.setDefaultAddressFromCheckouts2);
route.get('/addAddress',auth.user,userController.addAddressPage);
route.post('/changePassword',auth.user,userController.changePassword);
route.post('/addToCart',userController.addToCart);
route.post('/saveAddress',userController.saveAddress);
route.post('/addAddressFromCheckout',userController.addAddressFromCheckout)
route.post('/addAddressFromCheckout2',userController.addAddressFromCheckout2)
route.post('/address',userController.address);  
route.post('/cancelOrder',userController.cancelOrder);

route.put('/updateProfileDetails',auth.user,userController.updateProfileDetails);
route.put('/update-quantity',userController.updateQuantity);

route.delete('/addressDelete/:id',userController.addressDelete);
route.delete('/cartItemDelete/:id',userController.cartItemDelete);

//coupen
route.post('/applyCoupenCode',userController.applyCoupenCode);
route.post('/applyCoupenCodeFromCheckout2',userController.applyCoupenCodeFromCheckout2);

//orders
route.get('/selectedOrders',auth.user,userController.selectedOrders);
route.post('/dummySelect',userController.dmyselect);
route.post('/invoiceDownload',userController.invoiceDownload);

module.exports = route
