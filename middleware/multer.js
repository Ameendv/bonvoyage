const multer=require('multer')
const path = require('path')

//set storage
var storage=multer.diskStorage({
    destination:function(req,file,callback){
        callback(null,'uploads')
    },
    filename:function(req,file,callback){
      
        
        
        var ext=file.originalname.substring(file.originalname.lastIndexOf('.'))
        console.log(ext);
        callback(null,file.filename+'-'+Date.now()+ext)
    }
})


var store=multer({storage:storage});
module.exports=store;