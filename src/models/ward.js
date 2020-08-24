const mongoose = require('mongoose');

var wardSchema = mongoose.Schema({
    wardID :        {type: Number, required: true, unique: true},
    wardName:    {type: String, required: true, trim: true },
    bedCapacity : {type: Number, default: 0},
    beds : [{
        bedID :        {type: Number, required: true},
        patientName:    {type: String, trim: true},
        attendentName: {type: String, trim: true},
        allotedFrom: {type: Date},
        bedstatus: {
            type: String,
            default: "free",
            enum: ["occupied", "free"]
         }   
    }],
    wardStatus: {
        type: String,
        enum: ["active", "inactive"] 
     }   
}, {timestamps: true});

module.exports = mongoose.model('ward', wardSchema);