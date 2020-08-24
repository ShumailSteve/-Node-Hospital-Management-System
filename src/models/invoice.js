const mongoose = require('mongoose');

var invoiceSchema = mongoose.Schema({
    invoiceID :        {type: Number, required: true, unique: true},
    patientID : {type: Number, required: true, unique: true},
    patientName:  {type: String, trim: true},
    email:{type: String, trim: true},
    patientAdd: {type: String, trim: true},
    billingAdd : {type: String, trim: true},
    department : {type: String, trim: true},
    dueDate: {type: String},
    items: [{
        itemID :  {type: Number, required: true},
        itemName: {type: String, trim: true},
        description: {type: String, trim: true},        
        unitCost: {type: Number, required: true},
        qty: {type: Number, required: true},
        total: {type: Number, required: true}
    }],
    totalAmount: {type: Number, required: true},
    discount :{type: Number},
    taxper: {type: Number},
    grandTotal: {type: Number, required: true},
    otherInfo: {type: String, trim: true},
     status: {
        type: String,
        default: "sent",
        enum: ["sent", "paid"] 
     },     
}, {timestamps: true});

module.exports = mongoose.model('invoice', invoiceSchema);