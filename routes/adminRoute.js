const express                = require('express');
const adminRoute             = express();
const adminController        = require('../controllers/Admin/adminController');
const adminProductController = require('../controllers/Admin/adminProductController');
const adminCategoryController= require('../controllers/Admin/adminCategoryController');
const adminCoupenController  = require('../controllers/Admin/adminCoupenController');
const auth                   = require('../middleware/middlewares');
const upload                 = require('../multerConfig');

//adminroute
adminRoute.get('/',auth.admin,adminController.adminlogin);
adminRoute.get('/dashboard',auth.isAdmin,adminController.getHomePage);
adminRoute.post('/login',auth.admin,adminController.getDashboard);
adminRoute.get('/customers',auth.isAdmin,adminController.getCustomer);
adminRoute.get('/orders',auth.isAdmin,adminController.getOrders);
adminRoute.get('/banner',auth.isAdmin,adminController.getBanner);
adminRoute.get('/addCoupenPage',auth.isAdmin,adminController.addCoupenPage);
adminRoute.get('/salesReport',auth.isAdmin,adminController.getSalesReport)
adminRoute.post('/downloadSalesReport',auth.isAdmin,adminController.downloadSalesReport)

//controlproduct
adminRoute.get('/products',auth.isAdmin,adminProductController.getProduct);
adminRoute.get('/addProductPage',auth.isAdmin,adminProductController.addProduct);
adminRoute.get('/updateProduct/:id',auth.isAdmin,adminProductController.getUpdateProductPage);
adminRoute.post('/addingProduct',upload.array('productImages',5),adminProductController.addingProduct);
adminRoute.post('/productUpdated/:id',upload.array('image',3),adminProductController.productUpdated);
adminRoute.delete('/deleteProduct',adminProductController.deleteProduct);                              //deleting the product
adminRoute.delete('/deleteProductImage',adminProductController.deleteProductImage);                    //deleting the productimage

//controll category
adminRoute.get('/categories',auth.isAdmin,adminCategoryController.getCategories);
adminRoute.get('/addCategoryPage',auth.isAdmin,adminCategoryController.addcategoryPage)
adminRoute.get('/updateCategory/:id',auth.isAdmin,adminCategoryController.getUpdateCategoryPage);
adminRoute.post('/addingCategory',adminCategoryController.addingCategory);
adminRoute.put('/UpdatedCategory',adminCategoryController.updateCategory);
adminRoute.delete('/deleteCategory',adminCategoryController.deleteCategory);


//controll coupen
adminRoute.get('/editCoupen',auth.isAdmin,adminCoupenController.editCoupen);
adminRoute.get('/listUnlist',auth.isAdmin,adminCoupenController.listUnlistCoupen);
adminRoute.get('/coupen',auth.isAdmin,adminCoupenController.getCoupen);
adminRoute.post('/addingCoupen',auth.isAdmin,adminCoupenController.addingCoupen);
adminRoute.post('/listUnlist',auth.isAdmin,adminCoupenController.listUnlist);
adminRoute.put('/updateEditedCoupen',auth.isAdmin,adminCoupenController.updateEditedCoupen);
adminRoute.delete('/coupenDelete',adminCoupenController.coupenDelete);

//user(block/unblock)
adminRoute.post('/checkStatus',adminController.updateStatus)
//update order status
adminRoute.put('/updateStatus',adminController.updateOrderStatus)
//cancel order
adminRoute.post('/cancelOrder',adminController.cancelOrder)
//logout
adminRoute.post('/logout',adminController.logout);

module.exports = adminRoute;





