const mongoose = require('mongoose');

const departmentSchema = mongoose.Schema({
        id : {type: Number, required:true},
        name : {type: String, required: true},
        status : {
            type: String,
            required: true, 
            enum: ["active", "inactive"]
        }
}, {timestamps: true});

module.exports = mongoose.model('department', departmentSchema);