const mongoose = require('mongoose');

const employeeSchema = mongoose.Schema({
    id : {type: Number},
    firstName: {type: String, required: true, trim: true},
    lastName: {type: String,trim: true},
    username: {type: String, required: true, unique: true, trim: true},
    email: {type: String, required: true, unique: true, lowercase: true, trim: true},
    password: {type: String, required: true},
    age: {type: Number},
    joiningDate:{type: Date},
    // Add 'enum' of an array of options to force selection between a given number of options.
     gender: {
        type: String,
        enum: ["male", "female"] 
     },
     dutyDays: {type: String},
     dutyTime: {type: String},
     address: {type: String},
     educationDetails: {type: String},
     phone: {type: String},
     role : {
            type: String,
            enum : ["Doctor", "Nurse", "Pharmacist", "Accountant", "Receptionist"]
     },
     status: {
        type: String,
        enum: ["active", "inactive"] 
     }   
 }, {timestamps: true}
);

module.exports = mongoose.model('employee', employeeSchema);
