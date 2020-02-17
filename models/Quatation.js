const mongoose = require('mongoose');

const quatations = new mongoose.Schema({
    vendorId: {
        type: String,
        required: true
    },
    vendor_name: {
        type: String,
        required: true
    },
    purpose: {
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
    quatation_number: {
        type: String,
        required: true
    },
    quatation_URL: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
})
const QuatationSchema = mongoose.model('quatation', quatations)
module.exports = QuatationSchema