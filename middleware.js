const product=require("./models/home");  // this is use for only that user have a autherization edit and delete of listing
const Review=require("./models/review");// this is use for only that user have a autherization delete the review 

// this is the middleware for checking the user was not log in or not in wanderlust 
module.exports.isloggedin=(req,res,next)=>{
    if(!req.isAuthenticated()){  // req.isauthenticked is function to check user was login or not in wanderlust
      
        req.session.redirectUrl=req.originalUrl;   //req.originurl is find the you in which path and req have multiple data that in that data originurl dave the orginurl 
        req.flash("error","you must been logged in to do your task");
        return res.redirect("/login");  
     } 
     next();
}    


// this is use for only that user have a autherization edit and delete this is the middlware 
module.exports.isowner=async (req,res,next)=>{  
    let {id}=req.params;   
    let aproduct= await product.findById(id);     
    
    if(!aproduct.owner.equals(res.locals.curruser._id)) { 
      req.flash("error","you are not the owner of this product");  
      return res.redirect(`/products/${id}`);  
    } 
    next();
};





module.exports.saveRedirectUrl=(req,res,next)=>{   // this is use for save the url and access after or after add new listing show the log in page and then after go to the that page user have to do work 
    if(req.session.redirectUrl) {  
        res.locals.redirectUrl=req.session.redirectUrl;
    } 
    next() ;
};



// middleware of this is use for only that user have a autherization delete the review 
module.exports.isreviewauthor=async(req,res,next)=>{
    let {id,reviewId}=req.params;   

    let review= await Review.findById(reviewId);    
        
     
    if(!review.author.equals(res.locals.curruser._id)) {  
      req.flash("error","you are not the owner of this review");  
      return res.redirect(`/products/${id}`);   
    }   
    next();  
}; 