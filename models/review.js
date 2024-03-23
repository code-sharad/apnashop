const mongoose=require("mongoose");  
const schema=mongoose.Schema; 

const reviewschema=new schema({
    comment:String,
    rating:{ 
        type:String,      
        min:1,            
        max:5     
    }, 
    createdat:{
        type:Date,
        default:Date.now(),
 }, 
    author:{
        type:schema.Types.ObjectId,
        ref:"user" 
    }

}); 

module.exports=mongoose.model('review',reviewschema);