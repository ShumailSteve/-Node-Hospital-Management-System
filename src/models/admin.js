const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

var adminSchema = mongoose.Schema({
     username : {type: String,  required: true, trim: true},
     email : {type: String, unique: true, required: true, lowercase: true,  trim: true},
     password : {type: String, required: true},
     phone : {type: String, required: true},
     tokens: [ {
          token: {
               type: String,
               required: true
          }
     }],
}, {timestamps: true});

// Hash admin password before saving 
adminSchema.pre('save', async function (next) {
     const user = this
     if (user.isModified('password')) {
     user.password = await bcrypt.hash(user.password, 8)
     }
     next()
});


// Generate Authenication token 
// Methods adds instance method to documents
adminSchema.methods.generateAuthToken = async function() {
          const user = this;
          const token = jwt.sign({ _id: user._id.toString() }, 'thisisHMS');
          
          user.tokens = user.tokens.concat({token});
          await user.save();
          
          return token;
}

// Hide Private Data by overriding toJSON() method
adminSchema.methods.toJSON = function () {
     const user = this;

     // Convert user to object
     const userObject = user.toObject();

     //delete private data to limit data send to client
     delete userObject.password;
     delete userObject.tokens;

     return userObject;
}

// Find admin by credentials (email and pass)
// Statics adds static class method to Model
adminSchema.statics.findByCredentials = async (email, password) => {
          const user = await Admin.findOne({email});

          if(!user) {
               throw new Error("Unable to login");
          }

          const isMatch = await bcrypt.compare(password, user.password);

          if(!isMatch) {
               throw new Error("Wrong password");
          }

          return user;
}

const Admin = mongoose.model('admin', adminSchema);

module.exports = Admin;