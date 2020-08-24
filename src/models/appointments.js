const mongoose = require('mongoose');

var appointmentSchema = mongoose.Schema({
    id :        {type: Number},
    patientID: {type: String, required: true},
    patientName:    {type: String, required: true},
    department : {type: String, required: true},
    doctor: {type: String, required: true},
    appointmentDate: {type: String, required: true},
    appointmentTime: {type: String, required: true},
    message: {type: String},
    status: {
        type: String,
        enum: ["active", "inactive"] 
     }   
}, {timestamps: true});

module.exports = mongoose.model('appointment', appointmentSchema);