const mongoose = require('mongoose')

const facultySchema = new mongoose.Schema({
    name: {
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
    department: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
})
const Faculty = mongoose.model('Faculty', facultySchema)
module.exports = Faculty