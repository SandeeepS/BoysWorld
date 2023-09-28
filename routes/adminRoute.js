const express = require('express');
const adminRoute = express();
const adminController = require('../controllers/adminController');


//adminroute
adminRoute.get('/',adminController.adminPage);
adminRoute.post('/dashboard',adminController.getDashboard);
adminRoute.get('/dashboard',adminController.getDashboard);
adminRoute.get('/customers',adminController.getCustomer);
adminRoute.get('/products',adminController.getProduct);
adminRoute.get('/categories',adminController.getCategories);
adminRoute.get('/orders',adminController.getOrders);
adminRoute.get('/banner',adminController.getBanner);
module.exports = adminRoute;