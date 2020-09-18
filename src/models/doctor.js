const mongoose = require('mongoose');


var doctorSchema = mongoose.Schema({
    id : {type: Number, required: true},
    firstName: {type: String, required: true, trim: true},
    lastName: {type: String, trim: true},
    email: {type: String, unique: true, required: true, lowercase: true, trim: true},
    department: {type: String, trim: true, required: true},
    DOB: {type: String, required: true},
      // Add 'enum' of an array of options to force selection between a given number of options.
    gender: {
      type: String,
      required: true, 
      enum: ["male", "female"] 
   },
   address: {type: String, required: true},
  //  country: { type: String },
   city: {type: String, required: true},
   phone: {type: String, required: true, trim: true},
   availableDays: [
                    {type: String}
                  ],
   availableFrom: {type: String},  
   availableTill: {type: String}, 
   joiningDate:{type: String},
   educationDetails: {type: String, trim: true},  
   img: {type: Buffer},
   status: {
        type: String,
        required: true,
        enum: ["active", "inactive"] 
     },
    basicSalary: {type: Number},
    accommodation : {type: Number},
    conveyance: {type: Number},
    otherExpenses: {type: Number},
    totalSalary: {type: Number}
  },
  {timestamps: true});

module.exports = mongoose.model('doctor', doctorSchema);