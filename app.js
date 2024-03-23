require('dotenv').config()    // this is use for the use to .env file . 

const express=require("express");   
const app=express();               
const port=3000;  
const path=require("path");   
const methodoverride=require("method-override");// post patch put run
// const signuprouter=require("./router/signup.js");   
const ejsmate=require("ejs-mate");      

const mongourl=process.env.ATLASDB_URL;  
const product=require("./models/home");     
const user=require("./models/user");   
const wuser=require("./models/whishlist"); 
const ejs=require("ejs");
const  passport=require("passport");  
const localstratergy=require("passport-local");    
const bodyparser=require("body-parser"); // this is use for req.body data can acess .
const session=require("express-session"); // for cookies  
const mongostore=require("connect-mongo") ;  // this is use for create the mongo store 
const expresserror=require("./utils/expresserror.js"); 
const wrapasync=require("./utils/wrapasync.js");   
const flash=require("connect-flash"); 
const {saveRedirectUrl} =require("./middleware.js");      //this is use for redirect the back url after login 
const {isloggedin}=require("./middleware.js");            // this is the middleware for checking the user was not log in or not in wanderlust 
const {isowner}=require("./middleware.js");              // this is use for only that user have a autherization edit and delete this is the middlware 
const {productschema}=require("./schema.js");   
// these is for image uploading  
const multer=require("multer");              
const {storage}=require("./cloudconfig.js");        
 const upload=multer({storage});   
 const mongoose=require("mongoose"); 
 const review=require("./models/review.js");

 const productsrouter=require("./router/products.js"); // this is for use he router
 const userrouter=require("./router/users.js"); // this is for use he router
 const isreviewauthor=require("./middleware.js");
 const reviewsrouter=require("./router/review.js");// this is for use he router

 app.set("views",path.join(__dirname,"views")); // this is use for acees the ejs files .
 app.set("view engine","ejs");   
 app.use(express.urlencoded({extended:true}));  //for parsing the data by urlencoded but not the files in form 
 app.use(methodoverride("_method")); // use for put and delete req to run
 app.engine("ejs",ejsmate); 
 app.use(express.static(path.join(__dirname,"/public"))); //this is use for join the path of html css js 
//  app.use(bodyparser.json());
 app.use(bodyparser.urlencoded({extended:true}));   // this is use for req.body data can acess .

  
  




// this is for after 24hours you cant have relogin .
const store=mongostore.create({ 
    mongoUrl:mongourl, 
    crypto:{
       secret:process.env.SECRET,
 
    },  
    
    touchAfter:24*3600,
 });   
 
 store.on("error",()=>{
    console.log("error in mongo session store " ,err);
 });

// this is for cokkies

const sessionoptions={  
    store,
    secret:process.env.SECRET,
    resave:false,    
    saveUninitialized:true,   
    cookie:{
       expires:Date.now()+7*24*60*60*1000,
       maxAge:7*24*60*60*1000,
       httpOnly:true
    },
 };
  








main().then(()=>{  
    console.log("connected to db");   
}) .catch((err)=>{
    console.log(err);
});

async function main(){ 
    await mongoose.connect(mongourl); 
}









app.use(session(sessionoptions)); // for cookies   
app.use(flash());  // this is use for flashing the msg


// this is for passport 
app.use(passport.initialize());// a middleware intialize for passport 
app.use(passport.session()); // this is for user have not to do repetedly login sign up . 
passport.use(new localstratergy(user.authenticate())); 

passport.serializeUser(user.serializeUser());  // this is for session id not delted 
passport.deserializeUser(user.deserializeUser());// this is for to delted the session id 


//this is middleware for flash 
app.use ((req,res,next)=>{
    res.locals.success=req.flash("success");     
    res.locals.error=req.flash("error");       
    res.locals.curruser=req.user;    // this locals are use to send the data ejs templates 
                        // req.user ue for show signup or login or log out in wanderlusr
                     // req.user show data of current user login or not 
  next();
   });
 
 
   app.get("/products/search",async(req,res)=>{ 
                                       
     res.render("home/search.ejs");     
});   


app.post("/products/search",wrapasync(async(req,res)=>{
    let {pr}=req.body;    
     let pname=pr.toLowerCase();
    let aproducts=await product.find({});  
    
    let isfound;
    res.render("home/searchdata.ejs",{aproducts,pname,isfound});  

}));  


// this route is use for show the whishlist data .
app.get("/products/whishlists",isloggedin,wrapasync(async(req,res)=>{
            
    try{ 
    const cuser=res.locals.curruser._id;   

    const wproducts= await user.findById(cuser); 
      
    const ar=wproducts.whishlists;
    const or=[...new Set(ar)];   // this is use for collect the unique id.

   
    const allproducts=await product.find({});

res.render("home/whishlist.ejs",{or,allproducts}); }
catch{
    res.render("home/whishlist.ejs");
}
}));


 
app.get("/products/profile",wrapasync(async(req,res)=>{
         
      try{
        const currentuser=res.locals.curruser._id;       
   
        const udata= await user.findById(currentuser);  
    res.render("home/profile.ejs",{udata})}
    catch{
        res.render("home/profile.ejs"); 
    }
}));






app.use("/products",productsrouter); 


app.use("/products/:id/reviews",reviewsrouter); 

app.use("",userrouter); 




    // this route is use for add a product to whishlist
    app.get("/products/:id/addwhishlist",isloggedin,wrapasync(async(req,res)=>{
        
        
        
        let {id}=req.params; 


        const currentuser=res.locals.curruser._id;       
  
        const newwhishlist= await user.findById(currentuser);       
         
     

    //   const sh=await user.findOne({id}); 
       
  
    //   console.log(sh); 
    const j=await newwhishlist.whishlists


      
      
      for(let i=0;i<=j.length;i++){
        if(j[i]==id){ 
            req.flash("error","this product is already in your whishlist");    
            res.redirect(`/products/${id}`);       
         }
      }    


      for(let i=0;i<=j.length;i++){
        if(j[i]!=id){ 
              
            await newwhishlist.whishlists.push(id);  
            await newwhishlist.save(); 
            req.flash("success","this product is added in your whishlist");    
            res.redirect(`/products/${id}`);
         }
      } 
 }));    


 // this route is use for delete the whishlist data from user
 app.delete("/products/:id/addwhishlist",wrapasync(async(req,res)=>{ 

    let {id}=req.params; 

    const currentuser=res.locals.curruser._id;       

    await user.findByIdAndUpdate(currentuser,{$pull:{whishlists:id}});// this is used for delete the array element from user.whishlists
    res.redirect("/products/whishlists");  
   
 }));

   





// app.get("/products/search",async(req,res)=>{

//     res.render("home/profile.ejs"); 
// })

    

app.all("*",(req,res,next)=>{     
    next(new expresserror(404,"page not found"));
 });   


app.use((err,req,res,next)=>{  
 let{statuscode=500,message="something went wrong"}=err;                      
 res.status(statuscode).render("home/error.ejs",{message});                     

});



app.listen(port,()=>{
    console.log("server is listining on 3000 port");   
 });  