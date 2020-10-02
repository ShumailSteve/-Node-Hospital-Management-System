const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

var adminSchema = mongoose.Schema({
     username : {type: String, required: true, trim: true},
     email : {type: String, required: true, lowercase: true, unique: true, trim: true},
     password : {type: String, required: true},
     phone : {type: String, required: true}
}, {timestamps: true});

// Hash admin password before saving 
adminSchema.pre('save', async function (next) {
     const user = this
     if (user.isModified('password')) {
     user.password = await bcrypt.hash(user.password, 8)
     }
     next()
});

// Find admin by credentials (email and pass)
adminSchema.statics.findByCredentials = async (email, password) => {
          const user = await Admin.findOne({email});

          if(!user) {
               throw new Error("Unable to login");
          }

          const isMatch = await bcrypt.compare(password, user.password);

          if(!isMatch) {
               throw new Error("Wrong password, unable to login")
          }

          return user;
}

const Admin = mongoose.model('admin', adminSchema);

module.exports = Admin;