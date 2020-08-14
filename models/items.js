const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const itemsSchema = new Schema(
    {
        localItemNumber: {
            type: String,
            required: true,
        },
        foreignItemNumber: {
            type: String,
            // required: true,
        },
        foreignManufacturerName: {
            type: String,
        },
        info: {
            type: String,
        },
        note: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

const Items = mongoose.model('Items', itemsSchema);

module.exports = Items;
