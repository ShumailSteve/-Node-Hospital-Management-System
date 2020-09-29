const mongoose = require('mongoose');

var wardSchema = mongoose.Schema({
    wardID :        {type: Number, required: true, unique: true},
    wardName:    {type: String, required: true, trim: true },
    bedCapacity : {type: Number, default: 0},
    bedsAvailable : {type: Number, default: 0},
    bedsOccupied: {type: Number, default: 0},
    beds : [{
            bedID :        {type: Number},
            patient:    {   type: mongoose.Schema.Types.ObjectId,
                             ref: 'patient'       
            },
            attendentName: {type: String, trim: true},
            allotedFrom: {type: String},
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