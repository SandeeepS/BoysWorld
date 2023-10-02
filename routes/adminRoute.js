const express = require('express');
const adminRoute = express();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/middlewares');


//adminroute
adminRoute.get('/',auth.admin,adminController.adminlogin);
adminRoute.get('/dashboard',auth.isAdmin,adminController.getHomePage);
adminRoute.post('/login',adminController.getDashboard);
adminRoute.get('/customers',adminController.getCustomer);
adminRoute.get('/products',adminController.getProduct);
adminRoute.get('/categories',adminController.getCategories);
adminRoute.get('/orders',adminController.getOrders);
adminRoute.get('/banner',adminController.getBanner);
adminRoute.get('/addProductPage',adminController.addProduct);


//controlproduct
adminRoute.post('/addingProduct',adminController.addingProduct);
adminRoute.get('/updateProduct/:id',adminController.getUpdateProductPage);
adminRoute.post('/productUpdated/:id',adminController.productUpdated);
adminRoute.get('/deleteProduct/:id',adminController.deleteProduct);


//controll category
adminRoute.get('/addCategoryPage',adminController.addcategoryPage)
adminRoute.post('/addingCategory',adminController.addingCategory);
adminRoute.get('/deleteCategory/:id',adminController.deleteCategory);
adminRoute.get('/updateCategory/:id',adminController.getUpdateCategoryPage);
adminRoute.post('/UpdatedCategory/:id',adminController.updateCategory);


adminRoute.post('/logout',adminController.logout);
module.exports = adminRoute;

//user(block/unblock)
adminRoute.post('/checkStatus',adminController.updateStatus)

