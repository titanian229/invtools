const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const itemsSchema = new Schema({
    localItemNumber: {
        type: Number,
        required: true,
    },
    foreignItemNumber: {
        type: Number,
        required: true,
    },
    foreignCompanyName: {
        type: String,
    },
    notes: {
        type: String,
    },
});

const Items = mongoose.model('Items', itemsSchema);

module.exports = Items;
