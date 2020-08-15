
const processNSSDRItemsForInvoice = (item, transaction) => {
    const invoiceMatch = item.match(/1316\d\d\d\d\d\d\d/g);
    if (invoiceMatch) {
        transaction.invoiceNumber = invoiceMatch[0];
        return transaction;
    }
    return transaction;
};

const processNSSDRItem = (item, transaction) => {
    const dateMatch = item.match(/\d*\/\d*\/\d\d/g);
    if (dateMatch) {
        transaction.date = new Date(dateMatch[0]);
        return transaction;
    }

    const qtyMatch = item.match(/(^-\d\.\d\d$)|(^\d\.\d\d$)/g);
    if (qtyMatch) {
        if (!transaction.qty) transaction.qty = Number(qtyMatch[0]);
        return transaction;
    }

    const dollarMatch = item.match(/(^\d*\.\d*$)|(^-\d*\.\d*$)/g);
    if (dollarMatch) {
        if (!transaction.dollarAmount) transaction.dollarAmount = dollarMatch[0];
        return transaction;
    }

    const itemNumberMatch = item.match(/^\d\d\d\d*$/g);
    if (itemNumberMatch) {
        if (!transaction.itemNumber) transaction.itemNumber = itemNumberMatch[0];
        return transaction;
    }
    // console.log('failed to match', item);
    return transaction;
};

module.exports = (data) => {
    let nssdrInput = data
        .split('\n')
        .map((row) => row.trim())
        .filter((row) => row !== '');
    // .map(row => {
    // })
    const emptyTransaction = {
        itemNumber: '',
        date: '',
        qty: 0,
        invoiceNumber: '',
    };
    nssdrData = [];
    let index = 0;
    let transaction = Object.create(emptyTransaction);
    let previousTransaction;
    while (index < nssdrInput.length) {
        const row = nssdrInput[index];
        // console.log('processNSSDR -> row', row);

        let rowItems = row
            .split(' ')
            .map((item) => item.trim())
            .filter((item) => item !== '');

        // * Logic
        // Check for initial row, that describes item number, add that data to transaction,
        // Check next row for inventory number, if found add in, move two rows on, if not then move on to next row
        // if the row doesn't contain an item number, use the one from the previous dataset, if it does then update that

        rowItems.forEach((item) => {
            transaction = processNSSDRItem(item, transaction);
        });

        // Check for invalid row
        if (!transaction.dollarAmount || !transaction.qty) {
            // Move on to next row, reset the transaction
            console.log('There was a garbage row', row, transaction);
            transaction = Object.create(emptyTransaction);
            index = index + 1;
            continue;
        }

        if (!transaction.itemNumber) {
            //This is not a header row, use the previous item number
            // console.log('not a header row');
            // THERE SHOULD BE A PREV TRANSACTION
            if (previousTransaction.itemNumber) {
                transaction.itemNumber = previousTransaction.itemNumber;
            } else {
                console.log('There was a missing previous invoice');
                index = index + 1;
                continue;
            }
        }

        // Check is a header row, has item number and all that, will implicitly be missing transaction
        // Check next row for invoice, add to DB either way
        // console.log('checking for invoice, successful row');
        index = index + 1;
        const nextRow = nssdrInput[index];
        let nextRowItems = nextRow
            .split(' ')
            .map((item) => item.trim())
            .filter((item) => item !== '');

        nextRowItems.forEach((item) => {
            transaction = processNSSDRItemsForInvoice(item, transaction);
        });

        // Add to DB
        nssdrData.push(transaction);
        // console.log('Successful Row', transaction);
        if (!transaction.invoiceNumber) {
            console.log('missing invoice', transaction);
        } else {
            // Process next row as fresh item
            index = index + 1;
        }
        previousTransaction = Object.create(transaction);
        transaction = Object.create(emptyTransaction);
    }

    return nssdrData;
};