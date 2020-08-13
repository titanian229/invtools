const processTSARow = (item, inventoryTransaction) => {
    // Check if invoiceNumber
    const invoiceMatch = item.match(/1316\d\d\d\d\d\d\d/g);
    if (invoiceMatch) {
        inventoryTransaction.invoiceNumber = invoiceMatch[0];
        return inventoryTransaction;
    }

    // Check for date
    const dateMatch = item.match(/\d*\/\d*\/\d\d/g);
    if (dateMatch) {
        inventoryTransaction.date = new Date(dateMatch[0]);
        return inventoryTransaction;
    }

    const dollarMatch = item.match(/^(\d*\.\d*)$/g);
    if (dollarMatch) {
        inventoryTransaction.dollarAmount = dollarMatch[0];
        return inventoryTransaction;
    }

    const qtyMatch = item.match(/^\d$/g);
    if (qtyMatch) {
        inventoryTransaction.qty = qtyMatch[0];
        return inventoryTransaction;
    }

    const itemNumberMatch = item.match(/^\d\d\d\d*$/g);
    if (itemNumberMatch) {
        inventoryTransaction.itemNumber = itemNumberMatch[0];
        return inventoryTransaction;
    }
    console.log('UNMATCHED', item);
    return inventoryTransaction;
};

const processTSA = (data) => {
    //Extract each item, validate it's valid
    const processedData = [];
    data.forEach((row) => {
        let inventoryTransaction = {
            invoiceNumber: '',
            date: '',
            itemNumber: '',
            qty: 0,
            dollarAmount: 0,
        };

        row.forEach((item) => {
            inventoryTransaction = processTSARow(item, inventoryTransaction);
        });
        if (inventoryTransaction.itemNumber && inventoryTransaction.dollarAmount && inventoryTransaction.qty) {
            processedData.push(inventoryTransaction);
        }
        // console.log(inventoryTransaction);
    });
    return processedData;
};

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
        transaction.qty = qtyMatch[0];
        return transaction;
    }

    const dollarMatch = item.match(/(^\d*\.\d*$)|(^-\d*\.\d*$)/g);
    if (dollarMatch) {
        transaction.dollarAmount = dollarMatch[0];
        return transaction;
    }

    const itemNumberMatch = item.match(/^\d\d\d\d*$/g);
    if (itemNumberMatch) {
        transaction.itemNumber = itemNumberMatch[0];
        return transaction;
    }
    console.log('failed to match', item);
    return transaction;
};

// const processNSSDRRowTwo = (row, transaction) => {
//     // checking for the row that contains the invoice number
//     const invoiceMatch = item.match(/1316\d\d\d\d\d\d\d/g);
//     if (invoiceMatch) {
//         transaction.invoiceNumber = invoiceMatch[0];
//     }

//     return { transaction, indexUpdate: 0 };
// };

const processNSSDR = (data) => {
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
        console.log('processNSSDR -> row', row);

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
        if (!transaction.itemNumber && !transaction.dollarAmount && !transaction.qty) {
            // Move on to next row, reset the transaction
            console.log('There was a garbage row', row);
            transaction = Object.create(emptyTransaction);
            index = index + 1;
            continue;
        }

        if (!transaction.itemNumber) {
            //This is not a header row, use the previous item number
            console.log('not a header row');
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
        console.log('checking for invoice, successful row');
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
        if (!transaction.invoiceNumber) {
            console.log('missing invoice', transaction);
        } else {
            // Process next row as fresh item
            index = index + 1;
        }
        previousTransaction = Object.create(transaction);
        transaction = Object.create(emptyTransaction);

        // if (!transaction.itemNumber || !transaction.qty || !transaction.dollarAmount) {
        //     // row has bad data, didn't find anything, move to next
        //     index = index + 1;
        //     transaction = emptyTransaction;
        //     console.log('garbage row', row, transaction);
        //     continue;
        // }

        // if (transaction.itemNumber && transaction.qty && transaction.dollarAmount) {
        //     // got data I was looking for from row 1/2
        //     console.log('success, checking for invoice', transaction);
        //     const nextRow = nssdrInput[index + 1];
        //     let nextRowItems = nextRow
        //         .split(' ')
        //         .map((item) => item.trim())
        //         .filter((item) => item !== '');

        //     nextRowItems.forEach((item) => {
        //         transaction = processNSSDRItemsForInvoice(item, transaction);
        //     });

        //     // Now if transaction is added, go to 2 rows on and restart, else go to one row on and start over, adding the data in
        //     nssdrData.push(transaction);
        //     transaction = emptyTransaction
        //     if (transaction.invoiceNumber) {
        //         console.log('successfully found transaction', transaction);
        //         index = index + 2;
        //     } else {
        //         console.log('unsuccessful found transaction', transaction);
        //         index = index + 1;
        //     }

        //     continue;
        // }

        // console.log('somehow I find myself here');
    }

    return nssdrData;
};

module.exports = (data) => {
    // console.log(data)
    // let tsaInput = data.split('\n');
    // tsaInput = tsaInput.map((row) =>
    //     row
    //         .split('\t')
    //         .map((item) => item.trim())
    //         .filter((item) => item !== '' && item !== ' ')
    // );
    // const processedData = processTSA(tsaInput);
    // console.log('processedData', processedData);

    const nssdrData = processNSSDR(data);

    console.table(nssdrData);
};
