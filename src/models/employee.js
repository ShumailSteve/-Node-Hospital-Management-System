const mongoose = require('mongoose');

const employeeSchema = mongoose.Schema({
    id : {type: Number, required: true},
    firstName: {type: String, required: true, trim: true},
    lastName: {type: String, trim: true},
    email: {type: String, required: true, trim: true },
    joiningDate:{type: String},
    // Add 'enum' of an array of options to force selection between a given number of options.
     gender: {
        type: String,
        enum: ["male", "female"] 
     },
     dutyDays: [
                  {type: String}
               ],
     availableFrom: {type: String},
     availableTill: {type: String},
     address: {type: String},
     city: {type: String},
     phone: {type: String},
     role : {
            type: String,
            enum : ["Nurse", "Pharmacist", "Accountant", "Receptionist"]
     },
     basicSalary: {type: Number},
     otherExpenses: {type: Number},
     status: {
        type: String,
        enum: ["active", "inactive"] 
     }   
 }, {timestamps: true}
);

module.exports = mongoose.model('employee', employeeSchema);
