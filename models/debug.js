const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const debugSchema = new Schema(
    {
        information: String,
    },
    {
        timestamps: true,
    }
);

const Debug = mongoose.model('Debug', debugSchema);

module.exports = Debug;
