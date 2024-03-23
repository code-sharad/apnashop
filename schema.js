const joi=require("joi");

module.exports.productschema=joi.object({
    product:joi.object({   
        title:joi.string().required(),   
        description:joi.string().required(),   
        image1:joi.string().allow("",null),
        image2:joi.string().allow("",null),
        image3:joi.string().allow("",null),
        price:joi.number().required().min(0),  
        location:joi.string().required(),  
        country:joi.string().required(),  
        shopname:joi.string().required(),  
        phonenumber:joi.number().required().min(0), 
        size:joi.string().required(), 
     
    }).required()
});

 module.exports.reviewschema=joi.object({
    review:joi.object({
        rating:joi.number().required().min(1).max(5),
    comment:joi.string().required()
   }).required()
 });