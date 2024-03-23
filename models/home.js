const { number } = require("joi");  
const mongoose=require("mongoose");      
const schema=mongoose.Schema;     
const review=require("./review.js"); 
  
const homeSchema = new schema({ 
    title:{  
        type:String,  
    required:true , 
},
    description:String,
      
    image1:{
        url:String, 
     
       
    },

        
    image2:{
        url:String, 
      
    },

        
    image3:{
        url:String, 
       
     
    },

        

    
    price:Number,
    location:String,
    country:String, 
    shopname:String,  
     phonenumber:Number,
     size:String,
    owner:{  
        type:schema.Types.ObjectId, 
        ref:"user"       
        },   

        reviews:[ {
            type:schema.Types.ObjectId, 
            ref:"review", 
        }],
     
  
    
    
}); 

// this is middleware for after delete the listiing then reviews also delete 
homeSchema.post("findOneAndDelete",async(products)=>{ 
    if(products){ 
        await review.deleteMany({_id:{$in:products.reviews}});
    } 
});

const home=mongoose.model("products",homeSchema); 
module.exports=home;