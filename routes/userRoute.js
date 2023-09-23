const express = require('express');
const route = express();
const userController = require('../controllers/userController');


//user routes
route.get('/',userController.home);
route.get('/login',userController.loginPage);
route.get('/signup',userController.signupPage);
route.get('/shop',userController.shopPage);
route.get('/contact',userController.contactPage);


route.post('/loginUser',userController.userEntry);

module.exports = route
