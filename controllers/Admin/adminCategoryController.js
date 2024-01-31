const productModel  = require('../../models/productModel');
const categoryModel = require('../../models/categoryModel');


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
exports.addcategoryPage = async(req,res)=>{
    res.render('adminpanel/addCategory');
}

//adding category
exports.addingCategory = async(req,res)=>{
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
    }catch(err){
        console.error("error while creating categories",err);
        res.redirect('/admin/categories');
    }
}


//deleting categories
exports.deleteCategory = async(req,res)=>{
    try{
        const catId = req.params.id;
        await categoryModel.findByIdAndUpdate(catId,{isDelete:true}).exec();
        res.redirect('/admin/categories');
    }catch(err){
        console.error("error while deleting the category",err);
        res.redirect('/admin/categories');
    }
}


//updateCategoryPage
exports.getUpdateCategoryPage = async(req,res)=>{
    try{
        const catId = req.params.id;
        const cataToUpdate = await categoryModel.findById(catId).exec();
        res.render('adminpanel/updatecategory',{cataToUpdate});
    }catch(err){
        console.error("error while updating catogery",err)
        res.redirect('/admin/catogeries');
    }
}


//updating category
exports.updateCategory = async(req,res)=>{
    try{
        const catId = req.params.id;
        const {name} = req.body;
        let catOffer = req.body.catOffer;
        if(catOffer == ""){
            catOffer = 0;
        }
        await categoryModel.findByIdAndUpdate(catId,{$set:{"name":name,"offer":catOffer}}).exec();
        res.redirect('/admin/categories')
    }catch(err){
        console.error("error while updating the category",err);
        res.redirect('/admin/categories');
    }
}

