const express = require('express');
const adminRoute = express();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/middlewares');


//adminroute
adminRoute.get('/',auth.admin,adminController.adminlogin);
adminRoute.get('/dashboard',adminController.getHomePage);
adminRoute.post('/login',adminController.getDashboard);
adminRoute.get('/customers',adminController.getCustomer);
adminRoute.get('/products',adminController.getProduct);
adminRoute.get('/categories',adminController.getCategories);
adminRoute.get('/orders',adminController.getOrders);
adminRoute.get('/banner',adminController.getBanner);
adminRoute.get('/addProductPage',adminController.addProduct);

//controlproduct
adminRoute.post('/addingProduct',adminController.addingProduct);

adminRoute.post('/logout',adminController.logout);
module.exports = adminRoute;