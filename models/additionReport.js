const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const additionReportSchema = new Schema(
    {
        addedTransactionsNSSDR: [{type: Schema.Types.ObjectId, ref: 'NSSDR'}],
        addedTransactionsTSA: [{type: Schema.Types.ObjectId, ref: 'TSA'}],
        transactionsToSkip: [],
        transactionsWithErrors: [],
        dateRangeAdded: [{ earliest: String, latest: String }],
        dateRangeSkipped: [{ earliest: String, latest: String }],
        totalAdded: {
            type: Number,
        },
        totalSkipped: {
            type: Number,
        },
        totalErrors: {
            type: Number,
        },
    },
    {
        timestamps: true,
    }
);

const AdditionReport = mongoose.model('AdditionReport', additionReportSchema);

module.exports = AdditionReport;
