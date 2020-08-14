const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tsa1Schema = new Schema(
    {
        invoiceNumber: {
            type: String,
        },
        date: Date,
        itemNumber: {
            type: String,
            required: true,
        },
        qty: {
            type: Number,
            required: true,
        },
        dollarAmount: String,
    },
    {
        timestamps: true,
    }
);

const TSA = mongoose.model('TSA', tsa1Schema);

module.exports = TSA;
