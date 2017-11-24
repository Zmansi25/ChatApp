var mongoose = require('mongoose');

var userModel = mongoose.model('User');

//router level middleware for checking existing user.
module.exports.emailExist = function(req,res,next){
  userModel.findOne({'email':req.body.email},function(err,result){
    if(err){
      res.render('message',
                  {
                    msg:"Internal Server Error",
                    status:500,
                    error:err,
                    user:req.session.user
                  });
    } else if(result){
      res.render('message',
                  {
                    msg:"User Already Exist",
                    status:500,
                    error:result,
                    user:req.session.user
                  });
    } else{
      next();
    }
  });
};
