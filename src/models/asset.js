const mongoose = require('mongoose');

var assetSchema = mongoose.Schema({
    id :        {type: Number, required: true, unique: true},
    name:    {type: String, trim: true  },
    user : {type: String, trim: true},
    purchaseDate: {type: String, required: true},
    warrenty: {type: Number, required: true},
    warrentyEnd : {type: String, required: true},
    amount: {type: Number, required: true},

     status: {
        type: String,
        default: "approved",
        enum: ["approved", "pending", "returned"] 
     },
     
}, {timestamps: true});

module.exports = mongoose.model('asset', assetSchema);