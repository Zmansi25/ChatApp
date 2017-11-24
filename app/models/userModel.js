var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({

	userId: {
		type: String,
		default: "",
		required: true
	},
	username: {
		type: String,
		default: "",
		required: true
	},
	firstName: {
		type: String,
		default: ""
	},
	lastName: {
		type: String,
		default: ""
	},
	email: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	}

});

mongoose.model('User', userSchema);