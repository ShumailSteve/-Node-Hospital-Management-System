const mongoose = require('mongoose');


var doctorSchema = mongoose.Schema({
    id : {type: Number},
    firstName: {type: String, required: true, trim: true},
    lastName: {type: String, trim: true},
    email: {type: String, unique: true, required: true, lowercase: true, trim: true},
    department: {type: String, trim: true},
    DOB: {type: String, required: true},
      // Add 'enum' of an array of options to force selection between a given number of options.
    gender: {
      type: String,
      enum: ["male", "female"] 
   },
   address: {type: String},
  //  country: { type: String },
   city: {type: String},
   phone: {type: String, trim: true},
   availableDays: {type: String},
   availableFrom: {type: String},  
   availableTill: {type: String}, 
   joiningDate:{type: String},
   educationDetails: {type: String, trim: true},  
   img: {type: Buffer},
   status: {
        type: String,
        enum: ["active", "inactive"] 
     }
   },  {timestamps: true});

module.exports = mongoose.model('doctor', doctorSchema);