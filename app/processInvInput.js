const db = require('../models');

// TODO run logic before database entry creation

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
        inventoryTransaction.qty = Number(qtyMatch[0]);
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
    let tsaInput = data.split('\n').map((row) =>
        row
            .split('\t')
            .map((item) => item.trim())
            .filter((item) => item !== '' && item !== ' ')
    );

    const processedData = [];
    tsaInput.forEach((row) => {
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

const addIfNotPresent = async (item, collectionName, now) => {
    // Checks to see if there is a match, implicitly the current dataset contains no duplicates
    // Checks only from past DB, so the dateAdded must be at least 1 minute before now.
    const { itemNumber, date, qty, dollarAmount, invoiceNumber } = item;
    let matchObject = { itemNumber, qty, date, dollarAmount };
    if (invoiceNumber) {
        matchObject.invoiceNumber = invoiceNumber;
    }
    // console.log('checking matches for ', matchObject)
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

        // console.log('Total matches ', matchesPast);
    }

    if (matchesPast > 0) {
        // console.log('There were matches, skipping item', item);
        return;
    }

    if (!(item.itemNumber && item.date && item.qty && item.dollarAmount)) {
        console.log('Item is invalid, not adding');
        await db.Debug.create({
            information: `error in final step of item creation for item ${JSON.stringify(item)}`,
        });
        return;
    }
    console.log('ADDING ITEM', item)
    await db[collectionName].create(item);

};

module.exports = async (data) => {
    // console.log(data)

    // const processedData = processTSA(tsaInput);
    // console.log('processedData', processedData);
    const tsaData = processTSA(data);
    if (tsaData.length > 0) {
        // ADD TO DB
        // console.log(tsaData);
        // await db.TSA.insertMany(tsaData);
        // console.table(tsaData)

        // Checking if it exists in the DB, exact same with matching date, amount, item number, and if invoice that as well

        return tsaData;
    }
    const nssdrData = processNSSDR(data);
    if (nssdrData.length > 0) {
        // await db.NSSDR.insertMany(nssdrData);
        // console.table(nssdrData)
        const now = new Date();
        // console.log('CURRENT DB');
        // console.table(await db.NSSDR.find());

        for (let index = 0; index < nssdrData.length; index++) {
            const transaction = nssdrData[index];
            await addIfNotPresent(transaction, 'NSSDR', now);
        }
        // console.log('Database after change');
        // console.table(await db.NSSDR.find());
        // console.log('NSSDR DATA', await db.NSSDR.find())

        return nssdrData;
    }
    // console.table(nssdrData);
};
