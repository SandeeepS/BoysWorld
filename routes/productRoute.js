const express = require('express');
const pro_route = express();

const product_controller = require('../controllers/productController');

pro_route.use(express.json()); // for parsing application/json
pro_route.use(express.urlencoded({ extended: true }));
pro_route.use(express.static("views"));
pro_route.use(express.static(__dirname));

const path = require("path");

const multer = require('multer');
const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,'../views/productImages'),function(err,succ){
            if(err){
                throw err;
            }
        })
    },
    filename:function(req,file,cb){
        const name = Date.now()+'-'+file.originalname;
        cb(null,name,function(err,succ){
                if(err){
                    throw err;
                }
        })
    }
});

const upload = multer({storage:storage});

pro_route.post('/add_product',upload.array('images'),product_controller.add_product);
module.exports = pro_route;
