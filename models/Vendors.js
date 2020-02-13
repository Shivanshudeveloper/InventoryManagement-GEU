const mongoose = require('mongoose');

const vendors = new mongoose.Schema({
    vendor_name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
})
const VendorsSchema = mongoose.model('vendors', vendors)
module.exports = VendorsSchema