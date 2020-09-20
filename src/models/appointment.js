const mongoose = require('mongoose');

var appointmentSchema = mongoose.Schema({
    id :        {type: Number, required: true},
    patient : {
                 type: mongoose.Schema.Types.ObjectId, 
                 required: true,
                 ref: 'patient'
            },
    department : {type: String, required: true},
    doctor: { 
                type: mongoose.Schema.Types.ObjectId, 
                required: true,
                ref: 'doctor'
            },
    appointmentDate: {type: String, required: true},
    appointmentTime: {type: String, required: true},
    message: {type: String},
    status: {
        type: String,
        enum: ["active", "inactive"] 
     }   
}, {timestamps: true});

module.exports = mongoose.model('appointment', appointmentSchema);