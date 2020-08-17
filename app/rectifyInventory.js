// require('dotenv').config();
// const mongoose = require('mongoose');
// const MONGODB_URI = process.env.MONGODB_URI;
// mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
const db = require('../models');

const generateSingleCollectionReport = async (collectionName) => {
    // TODO in app, offer option to run this on any of provided reports submitted
    const uniqueItemNumbers = await db[collectionName].distinct('itemNumber');
    let report = { reportName: collectionName };

    for (let index = 0; index < uniqueItemNumbers.length; index++) {
        const itemNumber = uniqueItemNumbers[index];
        const allEntriesItem = await db[collectionName].find({ itemNumber });
        const sumEntriesItem = allEntriesItem.reduce((sums, item, index) => {
            if (index === 0) {
                return { qtySum: item.qty, dollarSum: Number(item.dollarAmount) };
            }

            let dollarSum = Number(sums.dollarSum) + Number(item.dollarAmount);
            dollarSum = Number(dollarSum.toFixed(2));
            return {
                qtySum: sums.qtySum + item.qty,
                dollarSum,
            };
        }, {});
        report[itemNumber] = sumEntriesItem;
    }

    return report;
};

const checkItemAndInvoiceObject = (items, reportObject) => {
    for (let index = 0; index < items.length; index++) {
        const item = items[index];
        const { itemNumber, invoiceNumber } = item;

        if (reportObject.hasOwnProperty(itemNumber)) {
            if (reportObject[itemNumber].hasOwnProperty(invoiceNumber)) {
                // Add to the total
                reportObject[itemNumber][invoiceNumber].qty = reportObject[itemNumber][invoiceNumber].qty + item.qty;
                reportObject[itemNumber][invoiceNumber].dollarAmount = Number(
                    (Number(reportObject[itemNumber][invoiceNumber].dollarAmount) + Number(item.dollarAmount)).toFixed(
                        2
                    )
                );
            } else {
                // create new total for this invoice
                reportObject[itemNumber][invoiceNumber] = {
                    qty: item.qty,
                    dollarAmount: Number(item.dollarAmount),
                };
            }
        } else {
            // create new total for this item and invoice
            reportObject[itemNumber] = {
                [invoiceNumber]: { qty: item.qty, dollarAmount: Number(item.dollarAmount) },
            };
        }
    }
    return reportObject;
};

const generateCheckBetweenCollectionsObject = async (collectionStart, collectionEnd) => {
    // This is an experment to generalist generateTSACheck to operate in either direction

    const uniqueItemNumbers = await db[collectionStart].distinct('itemNumber');
    // TODO add in optional date range provided from user

    let uniqueItemsAndInvoices = {};

    for (let index = 0; index < uniqueItemNumbers.length; index++) {
        const itemNumber = uniqueItemNumbers[index];
        const items = await db[collectionStart].find({ itemNumber }); //.distinct('invoiceNumber')

        uniqueItemsAndInvoices = checkItemAndInvoiceObject(items, uniqueItemsAndInvoices);
    }

    let finalReport = JSON.parse(JSON.stringify(uniqueItemsAndInvoices));

    for (let [itemNumber, invoices] of Object.entries(uniqueItemsAndInvoices)) {
        const invoicesForItem = Object.keys(invoices);
        for (let index = 0; index < invoicesForItem.length; index++) {
            const invoiceNumber = invoicesForItem[index];
            const matchingItems = await db[collectionEnd].find({ itemNumber, invoiceNumber });

            // Compare the item and invoice in the uiai object with the present, add and subtract as needed
            for (let invInd = 0; invInd < matchingItems.length; invInd++) {
                const item = matchingItems[invInd];

                let { qty, dollarAmount } = finalReport[itemNumber][invoiceNumber];

                qty = qty - item.qty;
                dollarAmount = Number((Number(dollarAmount) - Number(item.dollarAmount)).toFixed(2));

                finalReport[itemNumber][invoiceNumber] = { qty, dollarAmount };
            }
        }
    }
    // console.log(finalReport);
    let issueReport = {};
    for (let [itemNumber, invoices] of Object.entries(finalReport)) {
        for (let [invoice, data] of Object.entries(invoices)) {
            if (data.qty !== 0 || data.dollarAmount !== 0) {
                if (issueReport[itemNumber]) {
                    issueReport[itemNumber][invoice] = { ...data };
                } else {
                    issueReport[itemNumber] = { [invoice]: { ...data } };
                }
            }
        }
    }

    return issueReport;
};

const addStrings = (left, right, operation = '') => {
    if (operation === '' || operation === 'add') {
        return Number((Number(left) + Number(right)).toFixed(2));
    } else if (operation === 'subtract') {
        return Number((Number(left) - Number(right)).toFixed(2));
    } else {
        console.error('Invalid operation provided to addStrings', operation);
    }
};

const addToObject = (obj, key, value, operation = '') => {
    // Checks if obj key exists, either creates or increments
    if (!obj.hasOwnProperty(key)) {
        obj[key] = value;
        return obj;
    }
    for (const [valKey, existingValue] of Object.entries(value)) {
        obj[key][valKey] = addStrings(obj[key][valKey], existingValue, operation);
    }

    return obj;
};

const generateArrayUniqueItemsInvoices = (itemsForItemNumber) => {
    // Gets passed in a list of items, all with the same item number
    let invoices = {};

    for (let index = 0; index < itemsForItemNumber.length; index++) {
        const item = itemsForItemNumber[index];
        let { invoiceNumber, qty, dollarAmount } = item;

        if (!invoiceNumber) {
            invoiceNumber = 'undefined';
        }

        invoices = addToObject(invoices, invoiceNumber, { qty, dollarAmount: Number(dollarAmount) });
        // console.log("generateArrayUniqueItemsInvoices -> invoices", invoices)
    }

    return invoices;
};

const onlyUniqueItems = (value, index, self) => self.indexOf(value) === index;

const generateCheckBetweenCollectionsArray = async (collectionStart, collectionEnd) => {
    // This is an experment to generalist generateTSACheck to operate in either direction

    const uniqueItemNumbers = await db[collectionStart].distinct('itemNumber');
    // TODO add in optional date range provided from user

    let uniqueItemsAndInvoices = [];

    for (let index = 0; index < uniqueItemNumbers.length; index++) {
        const itemNumber = uniqueItemNumbers[index];
        const itemsForItemNumber = await db[collectionStart].find({ itemNumber }); //.distinct('invoiceNumber')

        const invoiceList = { itemNumber, invoices: generateArrayUniqueItemsInvoices(itemsForItemNumber) };

        uniqueItemsAndInvoices.push(invoiceList);
    }

    // return uniqueItemsAndInvoices;
    // Comparing to the opposite table now

    for (let index = 0; index < uniqueItemsAndInvoices.length; index++) {
        const { itemNumber, invoices } = uniqueItemsAndInvoices[index];

        const invoicesList = Object.keys(invoices);

        for (let invoicesIndex = 0; invoicesIndex < invoicesList.length; invoicesIndex++) {
            const invoiceNumber = invoicesList[invoicesIndex];
            const matchingItems = await db[collectionEnd].find({ itemNumber, invoiceNumber });

            for (let invInd = 0; invInd < matchingItems.length; invInd++) {
                const { qty, dollarAmount } = matchingItems[invInd];

                for (const [valKey, existingValue] of Object.entries({ qty, dollarAmount })) {
                    uniqueItemsAndInvoices[index].invoices[invoiceNumber][valKey] = addStrings(
                        uniqueItemsAndInvoices[index].invoices[invoiceNumber][valKey],
                        existingValue,
                        'subtract'
                    );
                }
                // let { qty, dollarAmount } = uniqueItemsAndInvoices[index].invoices[invoiceNumber];

                // qty = qty - item.qty;
                // dollarAmount = Number((Number(dollarAmount) - Number(item.dollarAmount)).toFixed(2));

                // uniqueItemsAndInvoices[index].invoices[invoiceNumber] = { qty, dollarAmount };
            }
        }
    }

    // REMOVE EMPTY ITEMS
    let itemIndicesToRemove = [];
    for (let index = 0; index < uniqueItemsAndInvoices.length; index++) {
        const { itemNumber, invoices } = uniqueItemsAndInvoices[index];

        const invoicesList = Object.keys(invoices);
        for (let invoicesIndex = 0; invoicesIndex < invoicesList.length; invoicesIndex++) {
            const invoiceNumber = invoicesList[invoicesIndex];
            const { qty, dollarAmount } = uniqueItemsAndInvoices[index].invoices[invoiceNumber];
            if (qty === 0 && dollarAmount === 0) {
                delete uniqueItemsAndInvoices[index].invoices[invoiceNumber];
            }
        }
    }

    uniqueItemsAndInvoices = uniqueItemsAndInvoices.filter((item) => Object.keys(item.invoices) > 0);

    return uniqueItemsAndInvoices;
};

const reduceTotalQtyDollarAmount = (accumulatedResults, row) => {
    accumulatedResults.qty = addStrings(accumulatedResults.qty, row.qty);
    accumulatedResults.dollarAmount = addStrings(accumulatedResults.dollarAmount, row.dollarAmount);
    return accumulatedResults;
};

const reduceTotalQtyDollarAmountDate = (accumulatedResults, row) => {
    accumulatedResults.qty = addStrings(accumulatedResults.qty, row.qty);
    accumulatedResults.dollarAmount = addStrings(accumulatedResults.dollarAmount, row.dollarAmount);

    if (accumulatedResults.date === null){
        accumulatedResults.date = row.date
    } else {
        if (accumulatedResults.date > row.date){
            accumulatedResults.date = row.date
        }
    }

    return accumulatedResults;
};

// TODO write check that gathers list of items from each array, and compares items in single loop
const completeCheck = async (dateStart = new Date(1900, 1, 1, 0, 0, 0, 0), dateEnd = new Date()) => {
    // generate unique items in tsa and nssdr and combine
    const uniqueItemsTSA = await db.TSA.distinct('itemNumber');
    const uniqueItemsNSSDR = await db.NSSDR.distinct('itemNumber');
    const uniqueItemNumbers = uniqueItemsTSA
        .concat(uniqueItemsNSSDR)
        .filter(onlyUniqueItems)
        .sort((a, b) => Number(a) - Number(b));

    // Now for each item number
    // I want to check TSA for and rows that include that, and grab the invoice number, qty, date, and dollar amount
    // Then likewise check NSSDR, grab all of the same for that item number
    const overviewReportItems = [];
    const finalReportItems = [];
    for (let uniqueItemNumberIndex = 0; uniqueItemNumberIndex < uniqueItemNumbers.length; uniqueItemNumberIndex++) {
        const itemNumber = uniqueItemNumbers[uniqueItemNumberIndex];

        const tsaRows = await db.TSA.find({ itemNumber }).then((results) =>
            results.map((row) => ({
                qty: row.qty,
                dollarAmount: Number(row.dollarAmount),
                date: row.date,
                invoiceNumber: row.invoiceNumber || 'undefined',
            }))
        );
        const nssdrRows = await db.NSSDR.find({ itemNumber }).then((results) =>
            results.map((row) => ({
                qty: -Number(row.qty),
                dollarAmount: -Number(row.dollarAmount),
                date: row.date,
                invoiceNumber: row.invoiceNumber || 'undefined',
            }))
        );

        const combinedRows = tsaRows.concat(nssdrRows).filter((row) => row.date > dateStart && row.date < dateEnd);

        const { qty, dollarAmount } = combinedRows.reduce(reduceTotalQtyDollarAmount, { qty: 0, dollarAmount: 0 });
        overviewReportItems.push({ itemNumber, qty, dollarAmount });

        // Generating the invoice report
        let invoices = combinedRows
            .map((row) => row.invoiceNumber)
            .filter(onlyUniqueItems)
            .sort((a, b) => Number(a) - Number(b));

        invoices = invoices.map((invoiceNumber) =>
            combinedRows
                .filter((row) => row.invoiceNumber === invoiceNumber)
                .reduce(reduceTotalQtyDollarAmountDate, { invoiceNumber, qty: 0, dollarAmount: 0, date: null })
        );

        finalReportItems.push({...invoices.reduce(reduceTotalQtyDollarAmount, {qty: 0, dollarAmount: 0}), itemNumber,  invoices });

        // const placeholderVariableName = combinedRows.reduce((accumulator, row) => {

        //     return accumulator
        // }, {})
    }

    const overviewReport = overviewReportItems.filter((item) => item.qty !== 0 && item.dollarAmount !== 0);
    const totalOverviewOffsets = overviewReport.reduce(reduceTotalQtyDollarAmount, { qty: 0, dollarAmount: 0 });

    const finalReport = finalReportItems
        .map((item) => ({
            ...item,
            invoices: item.invoices.filter((invoice) => invoice.qty !== 0 && invoice.dollarAmount !== 0),
        }))
        .filter((item) => item.invoices.length > 0);

    return { overviewReport, totalOverviewOffsets, finalReport };

    // console.log("completeCheck -> finalReport", finalReport)
    // Having that
    // sum the quantities for each item regardless of invoice number, sum the dollar amounts regardless of invoice.  Create a report agnostic of invoice as an overview, called overviewReport
    // overviewReport = [{itemNumber: <itemNumber>, qty: <totalQty>, dollarAmount: <totalDollarAmount>}]
    // ALSO do a reduce and calculate the total dollarAmount offset and total neg and pos offsets for date range
    // THEN

    // for each invoice, create an object that contains that same complete counter of qty and dollar ammount
    // finalReport = [{itemNumber: <itemNumber>, invoices: [ { invoiceNumber: <invoiceNumber>, qty: <totalQty>, dollarAmount: <totalDollarAmount> } ] }]
};

const generateTSACheck = async () => {
    const uniqueItemNumbers = await db.TSA.distinct('itemNumber');
    // TODO add in optional date range provided from user

    let uniqueItemsAndInvoices = {};

    for (let index = 0; index < uniqueItemNumbers.length; index++) {
        const itemNumber = uniqueItemNumbers[index];
        const items = await db.TSA.find({ itemNumber }); //.distinct('invoiceNumber')

        uniqueItemsAndInvoices = checkItemAndInvoiceObject(items, uniqueItemsAndInvoices);
    }
    // console.log(uniqueItemsAndInvoices);
    // * Now, checking each item and invoice number in the NSSDR DB

    let finalReport = JSON.parse(JSON.stringify(uniqueItemsAndInvoices));

    for (let [itemNumber, invoices] of Object.entries(uniqueItemsAndInvoices)) {
        const invoicesForItem = Object.keys(invoices);
        for (let index = 0; index < invoicesForItem.length; index++) {
            const invoiceNumber = invoicesForItem[index];
            const matchingItems = await db.NSSDR.find({ itemNumber, invoiceNumber });

            // Compare the item and invoice in the uiai object with the present, add and subtract as needed
            for (let invInd = 0; invInd < matchingItems.length; invInd++) {
                const item = matchingItems[invInd];

                let { qty, dollarAmount } = finalReport[itemNumber][invoiceNumber];

                qty = qty - item.qty;
                dollarAmount = Number((Number(dollarAmount) - Number(item.dollarAmount)).toFixed(2));

                finalReport[itemNumber][invoiceNumber] = { qty, dollarAmount };
            }
        }
    }
    // console.log(finalReport);
    let issueReport = {};
    for (let [itemNumber, invoices] of Object.entries(finalReport)) {
        for (let [invoice, data] of Object.entries(invoices)) {
            if (data.qty !== 0 || data.dollarAmount !== 0) {
                if (issueReport[itemNumber]) {
                    issueReport[itemNumber][invoice] = { ...data };
                } else {
                    issueReport[itemNumber] = { [invoice]: { ...data } };
                }
            }
        }
    }

    return issueReport;
};

// const rectify = async () => {
//     const collections = ['NSSDR', 'TSA'];

//     // ! This is the report for verifying the totals regardless of invoice
//     // let reports = await Promise.all(
//     //     collections.map((collectionName) => generateSingleCollectionReport(collectionName))
//     // );

//     // console.log(reports);

//     // ! Generating a report based on item number as well as invoice
//     // await generateTSACheck();
//     // const TSAtoNSSDR = await generateCheckBetweenCollectionsObject('TSA', 'NSSDR');
//     // console.log('rectify -> TSAtoNSSDR', TSAtoNSSDR);
//     // const NSSDRtoTSA = await generateCheckBetweenCollectionsArray('NSSDR', 'TSA');
//     // console.log('rectify -> NSSDRtoTSA', NSSDRtoTSA);

//     // ! Generating report in array format, comparing both collections
//     // const TSAReport = await generateCheckBetweenCollectionsArray('TSA', 'NSSDR');
//     // TSAReport.forEach((item) => console.log(item));

//     // ! Generate complete report
//     const report = await completeCheck();
//     console.log(report);

//     // TODO add in function to prettify this data, before sending it to the client.
//     // TODO make it a nice table format

//     // TSAReport.forEach(line => console.log(line))

//     // ! Now, check between those two, see if there are any entries in NSSDRtoTSA that don't have a match in the TSAtoNSSDR list and viceversa
//     // ! Create a final report, showing issues in each category.
//     // TODO add a catch for undefined invoices in NSSDRtoTSA check

//     mongoose.connection.close();
// };

// rectify();

module.exports = {
    completeCheck
}