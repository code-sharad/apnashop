require('dotenv').config()

const express=require("express");   
const product=require("../models/home");     
const wrapasync=require("../utils/wrapasync.js");   
const flash=require("connect-flash"); 
const {isloggedin}=require("../middleware.js");            // this is the middleware for checking the user was not log in or not in wanderlust 
// these is for image uploading  
const review=require("../models/review.js");
const {isreviewauthor}=require("../middleware.js");
 const router=express.Router({mergeParams:true}); // merge params is use for data is have or not in review and check in router
 const {reviewschema}=require("../schema.js");

 const validatereview=(req,res,next)=>{
    let {error}=reviewschema.validate(req.body); 
    if(error){
       let errmsg=error.details.map((error)=error.message).join(",");
 throw new expresserror(400,errmsg);
 
    }   
    else{
       next();
    }
 };
 

 router.post("/",isloggedin,validatereview,wrapasync(async(req,res)=>{  
          
    let oneproduct=await product.findById(req.params.id);
    let newreview=new review (req.body.review); 
    newreview.author=req.user._id; 
    oneproduct.reviews.push(newreview); 

    await newreview.save();   
    await oneproduct.save();   

    req.flash("success","review created"); 
    res.redirect(`/products/${oneproduct._id}`);

})); 


router.delete("/:reviewid",isloggedin,wrapasync(async(req,res)=>{
       
     let {id,reviewid}=req.params; 
     await product.findByIdAndUpdate(id,{$pull:{reviews:reviewid}});// this line use for deleting the review info from listing after delting the reviews 
    
    await review.findByIdAndDelete(reviewid); 
    req.flash("success","review deleted ! "); 
    res.redirect(`/products/${id}`); 

}));








 module.exports=router;