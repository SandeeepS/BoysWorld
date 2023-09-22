const express = require('express');
const route = express();
const userController = require('../controllers/userController');


//user routes
route.get('/',userController.home);

module.exports = route
