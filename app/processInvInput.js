const db = require('../models');
const formatDate = require('./utils/formatDate');
const nssdrProcessing = require('./transactionProcessing/nssdrProcessing');
const tsaProcessing = require('./transactionProcessing/tsaProcessing');

const checkUnique = async (item, collectionName, now) => {
    // Checks to see if there is a match, implicitly the current dataset contains no duplicates
    // Checks only from past DB, so the dateAdded must be at least 2 minute before now.

    const { itemNumber, date, qty, dollarAmount, invoiceNumber } = item;

    let matchObject = { itemNumber, qty, date, dollarAmount };
    if (invoiceNumber) {
        matchObject.invoiceNumber = invoiceNumber;
    }

    // Checking for matches in the DB
    const matches = await db[collectionName].find(matchObject);
    let matchesPast = 0;
    if (matches.length !== 0) {
        matches.forEach((match) => {
            const timeDiff = Math.abs((match.createdAt - now) / (1000 * 60));
            if (timeDiff > 2) {
                // console.log('Found a match in the DB from the past for this item, skipping ', match, item);
                matchesPast = matchesPast + 1;
            }
        });
    }

    if (matchesPast > 0) {
        return { item, status: 'duplicate' };
    }

    if (!(item.itemNumber && item.date && item.qty && item.dollarAmount)) {
        return { item, status: 'error' };
    }

    // Valid item to be added
    return { item, status: 'valid' };
};

const processDateRange = (array) => {
    return array.reduce((dateRange, item, index) => {
        if (index === 0) {
            // first item
            return { earliest: item.date, latest: item.date };
        }

        // Check if the date of the current item is before the earliest
        if (dateRange.earliest > item.date) {
            return { ...dateRange, earliest: item.date };
        }

        // Check if it's after the latest
        if (dateRange.latest < item.date) {
            return { ...dateRange, latest: item.date };
        }

        return dateRange;
    }, {});
};

const processTransactionsToAdd = async (transactions, collectionName, now) => {
    // This will accept all the items process in the report, check that each is unique using the checkUnique function
    // then return a report that includes the items to be added, items that were duplicated, and items that had an error

    const processTransactions = await Promise.all(
        transactions.map((transaction) => checkUnique(transaction, collectionName, now))
    );

    let transactionsToAdd = processTransactions
        .filter((transaction) => transaction.status === 'valid')
        .map((transaction) => transaction.item);

    let addedTransactions;
    try {
        addedTransactions = await db[collectionName].insertMany(transactionsToAdd);
        addedTransactions = addedTransactions.map((dbEntry) => dbEntry._id);
    } catch (err) {
        console.log(err);
        return err;
    }

    const transactionsToSkip = processTransactions
        .filter((transaction) => transaction.status === 'duplicate')
        .map((transaction) => transaction.item);
    const transactionsWithErrors = processTransactions
        .filter((transaction) => transaction.status === 'error')
        .map((transaction) => transaction.item);

    const dateRangeAdded = processDateRange(transactionsToAdd);
    const dateRangeSkipped = processDateRange(transactionsToSkip);

    const totalAdded = addedTransactions.length;
    const totalSkipped = transactionsToSkip.length;
    const totalErrors = transactionsWithErrors.length;

    const report = {
        ['addedTransactions' + collectionName]: addedTransactions,
        transactionsToSkip,
        transactionsWithErrors,
        dateRangeAdded,
        dateRangeSkipped,
        totalAdded,
        totalSkipped,
        totalErrors,
    };

    return report;
};

const saveReport = async (report) => {
    const savedReport = await db.AdditionReport.create(report);
    return savedReport;
};

module.exports = async (data) => {
    // console.log(data)
    const now = new Date();
    let collectionName;
    let transactions;

    const tsaData = tsaProcessing(data);
    if (tsaData.length > 0) {
        collectionName = 'TSA';
        transactions = tsaData;
    } else {
        const nssdrData = nssdrProcessing(data);
        if (nssdrData.length > 0) {
            collectionName = 'NSSDR';
            transactions = nssdrData;
        }
    }

    if (!collectionName) {
        return { error: 'No valid data present' };
    }

    const report = await processTransactionsToAdd(transactions, collectionName, now);
    await saveReport(report);

    let message = `Successfully added data, ${report.totalAdded} transactions added, ${report.totalSkipped} already present and skipped`;
    if (report.totalAdded > 0) {
        message =
            message +
            `, for a date range of ${formatDate(report.dateRangeAdded.earliest)} to ${formatDate(
                report.dateRangeAdded.latest
            )}`;
    }

    return { message };
};
