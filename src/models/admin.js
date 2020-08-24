const mongoose = require('mongoose');

var adminSchema = mongoose.Schema({
     username : {type: String, required: true, unique: true, trim: true},
     email : {type: String, required: true, lowercase: true, unique: true, trim: true},
     password : {type: String, required: true},
     phone : {type: String, required: true}
}, {timestamps: true});

module.exports = mongoose.model('admin', adminSchema);