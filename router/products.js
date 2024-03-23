require('dotenv').config()  

const express=require("express");        
 
 
const product=require("../models/home");         


const wrapasync=require("../utils/wrapasync.js");   
const {isloggedin}=require("../middleware.js");            // this is the middleware for checking the user was not log in or not in wanderlust 
const {isowner}=require("../middleware.js");              // this is use for only that user have a autherization edit and delete this is the middlware 
const {productschema}=require("../schema.js");   
// these is for image uploading 
const multer=require("multer");              
const {storage}=require("../cloudconfig.js");        
 const upload=multer({storage});    
 const mongoose=require("mongoose"); 
 const router=express.Router();    





 const validatelisting = (req, res, next) => { 
    let { error } = productschema.validate(req.body); 
    console.log(error);
    if (error) {
      let errMsg = error.details.map((el) => el.message).join(",");
      
      
     
      console.log("🔥 Error " + errMsg);  
    
      req.flash("error","write a correct data");  
      res.redirect("/products/new-product");
     
    } else { next()}};  








router.get("/",async(req,res)=>{ 
    const allproducts=await product.find({}); 
 res.render("home/home.ejs",{allproducts});   
 
 }); 


 
 // get the new product create form
 router.get("/new-product",isloggedin,(req,res)=>{
    res.render("home/new.ejs");
 });  


 
 // add the new product  
 router.post("/",upload.fields([{name:'image1'},{name:'image2'},{name:'image3'}]),validatelisting, wrapasync(async(req,res)=>{
     



    const paths = {
        image1: req.files['image1'][0].path,  
        image2: req.files['image2'][0].path,  
        image3: req.files['image3'][0].path,        
      }; 


      console.log(req.body.product.title); 
      let e=req.body.product.title;
      let ntitle=e.toLowerCase();
       

    const newproduct=new product(req.body.product);         
    newproduct.owner=req.user._id; // this is use for add the current user add listing user name help by req.user through the passport 
    newproduct.title=ntitle; 
    newproduct.image1.url=paths.image1;  
    newproduct.image2.url=paths.image2;  
    newproduct.image3.url=paths.image3;  
  
     await newproduct.save(); 
     
   
     res.redirect("/products");
 })); 
 
//get the show in detailed
router.get("/:id",async(req,res)=>{  
    let {id}=req.params; 
    let aproducts=await product.find({});  
    const  allproducts=await product.findById(id)
   .populate({
      path:"reviews",    // polpulate is use for use to refrence id detailed information 
      populate:{
      path:"author",
      },
     })
       .populate("owner");

    if(!allproducts){    
        req.flash("error","product you requested for does not exists!");
        res.redirect("/products");
    
      }   
      let name=allproducts.title; 

    res.render("home/show.ejs",{allproducts,aproducts,name}); 
 }); 


 

// get edit form  

router.get("/:id/edit",isloggedin,isowner,wrapasync(async(req,res)=>{    
    let {id}=req.params; 
    const  allproducts=await product.findById(id)
    res.render("home/edit.ejs",{allproducts});  
}));


router.put("/:id",isloggedin,upload.fields([{name:'image1'},{name:'image2'},{name:'image3'}]),validatelisting,wrapasync(async(req,res)=>{
    let {id}=req.params;
    
    let uproduct=await product.findByIdAndUpdate(id,{...req.body.product}); 


 
   
     if( req.files['image1'][0]){

    const i1 = {
        image1: req.files['image1'][0].path,  
         
      }; 
      uproduct.image1.url=i1.image1;   }


     if(req.files['image2'][0]){

        const i2 = {
            image2: req.files['image2'][0].path,  
          
          }; 
          uproduct.image2.url=i2.image2;   }   




           if(req.files['image3'][0]){

            const i3 = {
                image3: req.files['image3'][0].path,  
                
              }; 
              uproduct.image3.url=i3.image3;   } 
 await uproduct.save(); 
 req.flash("success"," product is updated ! ");
 res.redirect("/products");
}));   




// buy get

router.get("/:id/buy",isloggedin,async(req,res)=>{
    let {id}=req.params;  
    const  allproducts=await product.findById(id) 
        res.render("home/buy.ejs",{allproducts}); 
 })


 //delete the product
 router.delete("/:id",isloggedin,isowner,wrapasync(async(req,res)=>{ 

    let {id}=req.params; 
    let deleteproduct=await product.findByIdAndDelete(id);
   
   
    req.flash("success"," product is Deleted ! ");

    res.redirect("/products");


 })); 

   module.exports=router;