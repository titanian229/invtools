const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const nssdrSchema = new Schema(
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

const NSSDR = mongoose.model('NSSDR', nssdrSchema);

module.exports = NSSDR;
