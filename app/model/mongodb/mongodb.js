const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

mongoose.connect('mongodb://sandy:sandy123@ds157639.mlab.com:57639/sandystorm');

const registerSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true,
    min: 6
  },
  token: {
    type: String,
    default: null
  }
});

const registerModel = mongoose.model('register', registerSchema, 'Registration');

module.exports = registerModel;
