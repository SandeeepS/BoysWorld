const express                = require('express');
const adminProdutRoute       = express();
const adminProductController = require('../controllers/adminProductController');
const auth                   = require('../middleware/middlewares');
const upload                 = require('../multerConfig');

