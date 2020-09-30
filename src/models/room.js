const mongoose = require('mongoose');

var roomSchema = mongoose.Schema({
    id :        {type: Number, required: true, unique: true},
    details : {type: String, trim: true},
     patient: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: 'patient'
               },  
     attendentName: {type: String},
     allotedFrom : {type: String},
     status: {
      type: String,
      default: "free",
      enum: ["free", "occupied"] 
   },
}, {timestamps: true});

module.exports = mongoose.model('room', roomSchema);