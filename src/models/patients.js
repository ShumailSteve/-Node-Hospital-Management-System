const mongoose = require('mongoose');
const getDate = require('../functions/getDate');

var patientSchema = mongoose.Schema({
    id :        {type: Number, unique: true},
    firstName: {type: String, required: true, trim: true},
    lastName:    {type: String,trim: true},
    age:        {type: Number},
    // Add 'enum' of an array of options to force selection between a given number of options.
     gender:    {
                type: String,
                enum: ["male", "female"] 
            },
    disease : {type: String, trim: true },
    bloodGroup: {type: String},
    address:   {type: String},     
    city:      {type: String},    
    phone:     {type: String},
    email:     {type: String},
    admitDate : { type: String},
    status: {
        type: String,
        enum: ["active", "inactive"] 
     }
}, {timestamps: true});

patientSchema.pre('save', function (next) {
        const d = new Date();
        this.admitDate = d.toISOString().split('T')[0];
        next();
});

module.exports = mongoose.model('patient', patientSchema);