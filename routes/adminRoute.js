const express = require('express');
const adminRoute = express();
const adminController = require('../controllers/adminController');


//adminroute
adminRoute.get('/',adminController.adminPage);
module.exports = adminRoute;