require('dotenv').config();
const mongoose = require('mongoose');
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
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

const generateCheckBetweenCollections = async (collectionStart, collectionEnd) => {
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

    return issueReport


}

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

    return issueReport
};

const rectify = async () => {
    const collections = ['NSSDR', 'TSA'];

    // ! This is the report for verifying the totals regardless of invoice
    // let reports = await Promise.all(
    //     collections.map((collectionName) => generateSingleCollectionReport(collectionName))
    // );

    // console.log(reports);

    // ! Generating a report based on item number as well as invoice
    // await generateTSACheck();
    const TSAtoNSSDR = await generateCheckBetweenCollections('TSA', 'NSSDR')
    console.log("rectify -> TSAtoNSSDR", TSAtoNSSDR)
    const NSSDRtoTSA = await generateCheckBetweenCollections('NSSDR', 'TSA')
    console.log("rectify -> NSSDRtoTSA", NSSDRtoTSA)

    // ! Now, check between those two, see if there are any entries in NSSDRtoTSA that don't have a match in the TSAtoNSSDR list and viceversa
    // ! Create a final report, showing issues in each category.
    // TODO add a catch for undefined invoices in NSSDRtoTSA check

    mongoose.connection.close();
};

rectify();
