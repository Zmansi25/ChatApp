var express = require('express');
var mongoose = require('mongoose');
var shortid = require("shortid");

//middlewares for the app.
var validator = require('../../middlewares/validator.js');
var auth = require('../../middlewares/auth.js');
var encrypt = require('../../middlewares/passwordEncrypt.js');

var userRouter = express.Router();

var userModel = mongoose.model('User');

module.exports.controller = function (app) {

	//api for homepage.
	userRouter.get('/', function (req, res) {
		res.render('home');
	});
	//api to get signup page
	userRouter.get('/signup', auth.loggedIn, function (req, res) {
		res.render('signup', {
			title: "Singup to Get Started",
			user: req.session.user,
			chat: req.session.chat
		});
	});

	//api to get login page
	userRouter.get('/login', auth.loggedIn, function (req, res) {
		res.render('login', {
			title: "Login to Get Started",
			user: req.session.user,
			chat: req.session.chat
		})
	});

	//api for logout
	userRouter.get('/logout', function (req, res) {
		delete req.session.user;
		res.redirect('/users/login');
	});
	//api to sign up
	userRouter.post("/api/signup", auth.loggedIn, validator.emailExist, function (req, res) {

		var id = shortid.generate();
		var encryptedPass = encrypt.encryptPassword(req.body.password);

		var newUser = new userModel({
			userId: id,
			username: req.body.username,
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			email: req.body.email,
			password: encryptedPass,

		});
		console.log(newUser);
		newUser.save(function (err, result) {
			if (err) {
				res.render('message', {
					msg: "Internal server error!Try Again.",
					status: 500,
					error: err,
					user: req.session.user,
					chat: req.session.chat
				});
				console.log(err);


			} else if (result == "" || result == undefined) {
				res.render('message', {
					msg: "Singup unsuccessful!Try Again.",
					status: 404,
					user: req.session.user,
					chat: req.session.chat
				});
				res.send("empty");
			} else {

				req.user = result;
				delete req.user.password;
				req.session.user = result;
				delete req.session.user.password;

				res.redirect('/users/login');
			}
		});
	});

	//api for login 

	userRouter.post('/api/login', auth.loggedIn, function (req, res) {
		var encryptedPass = encrypt.encryptPassword(req.body.password);
		userModel.findOne({
			$and: [{
				'email': req.body.email
			}, {
				'password': encryptedPass
			}]
		}, function (err, foundUser) {
			if (err) {
				res.render('message', {
					msg: "Internal server error!Try Again.",
					status: 500,
					error: err,
					user: req.session.user,
					chat: req.session.chat
				});
			} else if (foundUser == null || foundUser == undefined || foundUser.username == undefined) {
				res.render('message', {
					msg: "Login unsuccessful!Try Again.",
					status: 404,
					user: req.session.user,
					chat: req.session.chat
				});
			} else {
				//    console.log(req.session);
				req.user = foundUser;
				delete req.user.password;
				req.session.user = foundUser;
				delete req.session.user.password;
				console.log(foundUser);
				res.redirect('/chat');

			}
		});
	});

	// this should be the last line
	// now making it global to app using a middleware
	// think of this as naming your api 
	app.use('/users', userRouter);

}