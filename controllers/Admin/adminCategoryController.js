const productModel  = require('../../models/productModel');
const categoryModel = require('../../models/categoryModel');
const { error } = require('jquery');


//get gategory page
exports.getCategories = async (req, res,next) => {
    try {
        const page = req.query.page || 1;
        const currentPage = parseInt(page);
        console.log("current page:",currentPage);
        const itemsPerPage = 5;
        const skip = (page - 1) * itemsPerPage;
        const totalCount = await productModel.countDocuments({isDeleted:false}).exec();
        console.log("totalcount:",totalCount);
        const totalPages = Math.floor(totalCount/itemsPerPage);
        console.log("totalpages:",totalPages);
        const categoryData = await categoryModel
                  .find({isDelete:false})
                  .skip(skip)
                  .limit(itemsPerPage)
                  .exec();
        console.log(categoryData);
        if (!categoryData) {
              console.log("No categories found in the database.");
        } else {
            res.render('adminpanel/categories', { category: categoryData,totalPages,currentPage,totalCount });
        }
    } catch (error) {
        console.error("Error while fetching categories", error);
        next(error);
    }
}

//adding category page
exports.addcategoryPage = async(req,res,next)=>{
    try{
        res.render('adminpanel/addCategory');
    }catch(error){
        console.log("error while getting addcategory page",error);
        next(error);
    }
}

//adding category
exports.addingCategory = async(req,res,next)=>{
    try{
        const {name} = req.body;
        let catOffer = req.body.catOffer;
        if(catOffer == ""){
            catOffer = 0 ;
        }
        const lowercasename = typeof name === 'string' ? name.toLowerCase() : name;
        const existingCategory = await categoryModel.findOne({ "name": { $regex: new RegExp('^' + lowercasename + '$', 'i') }})
        console.log("existing category",existingCategory);
       if(existingCategory){
           await categoryModel.updateOne({"name":{ $regex: new RegExp('^' + lowercasename + '$', 'i') }},{$set:{"isDelete":false}});
           console.log("category already exists .updated existing category");
       }else{
         const newCategory = new categoryModel({
           "name":name,
           "offer":catOffer,
            "isDelete":false
         });
         await newCategory.save();
         console.log("category added successfully");
       }
        res.redirect('/admin/categories');
    }catch(error){
        console.error("error while creating categories",error);
        next(error);
    }
}


//deleting categories
exports.deleteCategory = async(req,res,next)=>{
    try{
        const catId = req.body.catId;
        await categoryModel.findByIdAndUpdate(catId,{isDelete:true}).exec();
        res.status(200).json({sucess:true,message:"dleted successfully"});
    }catch(error){
        console.error("error while deleting the category",error);
        next(error);
    }
}


//updateCategoryPage
exports.getUpdateCategoryPage = async(req,res,next)=>{
    try{
        const catId = req.params.id;
        const cataToUpdate = await categoryModel.findById(catId).exec();
        res.render('adminpanel/updatecategory',{cataToUpdate});
    }catch(error){
        console.error("error while updating catogery",error)
        next(error);
    }
}


//updating category
exports.updateCategory = async(req,res,next)=>{
    try{
        const {name,catId } = req.body;
        let catOffer = req.body.catOffer;
        if(catOffer == ""){
            catOffer = 0;
        }
        await categoryModel.findByIdAndUpdate(catId,{$set:{"name":name,"offer":catOffer}}).exec();
        res.status(200).json({sucess:true,message:"updated successfull"});
    }catch(error){
        console.error("error while updating the category",error);
        next(error);
    }
}

