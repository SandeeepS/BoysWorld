const express = require('express');
const adminRoute = express();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/middlewares');
const upload = require('../multerConfig');


//adminroute
adminRoute.get('/',auth.admin,adminController.adminlogin);
adminRoute.get('/dashboard',auth.isAdmin,adminController.getHomePage);
adminRoute.post('/login',adminController.getDashboard);
adminRoute.get('/customers',auth.isAdmin,adminController.getCustomer);
adminRoute.get('/products',auth.isAdmin,adminController.getProduct);
adminRoute.get('/categories',auth.isAdmin,adminController.getCategories);
adminRoute.get('/orders',auth.isAdmin,adminController.getOrders);
adminRoute.get('/banner',auth.isAdmin,adminController.getBanner);
adminRoute.get('/addProductPage',auth.isAdmin,adminController.addProduct);


//controlproduct
adminRoute.post('/addingProduct',upload.array('productImages',5),adminController.addingProduct);
adminRoute.get('/updateProduct/:id',auth.isAdmin,adminController.getUpdateProductPage);
adminRoute.post('/productUpdated/:id',adminController.productUpdated);
adminRoute.get('/deleteProduct/:id',adminController.deleteProduct);


//controll category
adminRoute.get('/addCategoryPage',auth.isAdmin,adminController.addcategoryPage)
adminRoute.post('/addingCategory',adminController.addingCategory);
adminRoute.get('/deleteCategory/:id',adminController.deleteCategory);
adminRoute.get('/updateCategory/:id',auth.isAdmin,adminController.getUpdateCategoryPage);
adminRoute.post('/UpdatedCategory/:id',adminController.updateCategory);


adminRoute.post('/logout',adminController.logout);
module.exports = adminRoute;

//user(block/unblock)
adminRoute.post('/checkStatus',adminController.updateStatus)

