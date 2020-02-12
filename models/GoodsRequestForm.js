const mongoose = require('mongoose')

const GoodsRequest = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    vendor_name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    purchase_order_number: {
        type: String,
        required: true
    },
    quotation_details: {
        type: String,
        required: true
    },
    product_purchased_details: {
        type: String,
        required: true
    },
    attachment_URL: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
})
const GoodsRequestSchema = mongoose.model('goodsrequest', GoodsRequest)
module.exports = GoodsRequestSchema