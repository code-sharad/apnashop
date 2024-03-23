const mongoose=require("mongoose");
const schema=mongoose.Schema;  
const passportlocalmongoose=require("passport-local-mongoose");
//  const uniqueValidator=require("mongoose-unique-validator");
const userschema= new schema({
    email:{    
        type:String,     
        required:true,  
    },   
    whishlists:[{
           type:String, 
         
          
         

           
    }]

});

userschema.plugin(passportlocalmongoose); 
// userschema.plugin(uniqueValidator);

module.exports=mongoose.model("user",userschema); 

