const mongoose = require('mongoose');

var roomSchema = mongoose.Schema({
    id :        {type: Number, required: true, unique: true},
    type:    {type: String, trim: true  },
    details : {type: String, trim: true},
     status: {
        type: String,
        default: "free",
        enum: ["free", "occupied"] 
     },
     patientID: {type: Number},  
     patientName : {type: String, trim: true  },
     attendentName: {type: String},
     allotedFrom : {type: Date}
}, {timestamps: true});

module.exports = mongoose.model('room', roomSchema);