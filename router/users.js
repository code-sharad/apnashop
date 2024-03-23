const express=require("express");    

const  passport=require("passport");    

const user=require("../models/user");  

const wrapasync=require("../utils/wrapasync.js");   
const {saveRedirectUrl} =require("../middleware.js");      //this is use for redirect the back url after login 
 
 const router=express.Router();    


  
 router.get("/signup",(req,res)=>{
    res.render("user/signup.ejs");
});     


router.post("/signup",wrapasync(async(req,res)=>{ 
try{   
  let {username,email,password}=req.body; 
const newuser=new user({email,username});
const registereduser=await user.register(newuser,password); 


req.login(registereduser,(err)=>{ // this req.log in function is of passport this is use for automatacally login after signup 
   if(err){
      return next(err);
} 
req.flash("success","welcome to apnashop!");
res.redirect("/products");
})

   }
   catch(e){
      req.flash("error",e.message);
      res.redirect("/signup");
   }

   


}));  


router.get("/login",(req,res)=>{  
res.render("user/login.ejs"); 
});


router.post("/login", passport.authenticate("local",                                //pasport authenticate was check user have signup or not first
{failureRedirect:"/login", 
failureFlash:true,}),saveRedirectUrl,(req,res)=>{ 
req.flash("success","Welecome back to the apnashop");

let redirecturl=res.locals.redirectUrl||"/login";
  res.redirect("/products");
}); 


router.get("/logout",(req,res,next)=>{
req.logout((err)=>{    // this log out function is of passport predefined automatically they log out the user
 if(err){   
    return next(err);

 }    
 req.flash("success","you are logged out");
 res.redirect("/products");
});
}   );



module.exports=router;
