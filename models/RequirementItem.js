const mongoose = require('mongoose');

const requirement = new mongoose.Schema({
    request_by: {
        type: String,
        required: true
    },
    request_by_id: {
        type: String,
        required: false
    },
    purpose: {
        type: String,
        required: true
    },
    item: {
        type: String,
        required: true
    },
    specification: {
        type: String,
        required: true
    },
    approved: {
        type: Boolean,
        required: true
    },
    rejected: {
        type: Boolean,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
})
const RequirementSchema = mongoose.model('requirement_item', requirement)
module.exports = RequirementSchema