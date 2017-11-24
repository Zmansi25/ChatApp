var express = require('express');
var mongoose = require('mongoose');
var chatRouter = express.Router();


var auth = require('../../middlewares/auth.js');


var chatModel = mongoose.model('Chat');
var userModel = mongoose.model('User');


module.exports.controller = function (app) {

  chatRouter.get('/chat', auth.checkLogin, function (req, res) {

    console.log("hi", req.session.user);

    res.render('chat', {
      user: req.session.user,
      chat: req.session.chat
    });

  });
  app.use(chatRouter);


}