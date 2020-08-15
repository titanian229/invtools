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

module.exports = (data) => {
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
}