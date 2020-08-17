import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Report from '../components/Report';
import API from '../utils/API';

import InventoryTable from '../components/InventoryTable';

const useStyles = makeStyles((theme) => ({
    container: { padding: theme.spacing(1, 2) },
    table: {},
    header: {
        margin: theme.spacing(2, 0),
    },
    generateContainer: {

    },
    generateButton: {
        marginTop: theme.spacing(2)
    },
}));

const columns = [
    {
        id: 'itemNumber',
        label: 'ItemNumber',
        minWidth: 186,
    },
    {
        id: 'qty',
        label: 'Qty',
        minWidth: 186,
    },
    {
        id: 'dollarAmount',
        label: '$',
        minWidth: 150,
    },
    {
        id: 'invoiceNumber',
        label: 'Invoice',
        minWidth: 150,
    },
    // {
    //     id: 'foreignManufacturerName',
    //     label: 'Manufac',
    //     minWidth: 150,
    // },
    // {
    //     id: 'foreignManufacturerName',
    //     label: 'Manufac',
    //     minWidth: 150,
    // },
];

const InventoryRectification = () => {
    const [loading, setLoading] = useState(true);
    const [nssdr, setNssdr] = useState([]);
    const [tsa, setTsa] = useState([]);
    const [report, setReport] = useState(null);
    const classes = useStyles();

    // TODO allow for editing of nssdr and tsa directly on this page, log original state and change them

    const fetchData = async () => {
        const nssdrData = await API.getNSSDR();
        console.log('fetchData -> nssdrData', nssdrData);
        if (!nssdrData.error) {
            setNssdr(nssdrData.NSSDR);
        }
        const tsaData = await API.getTSA();
        if (!tsaData.error) {
            setTsa(tsaData.TSA);
        }
    };

    const fetchReport = async () => {
        const reportContents = await API.getReport()
        setReport(reportContents)
    }

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <Box className={classes.container}>
            <Typography variant="h4">Reports</Typography>
            <Button onClick={fetchReport} variant="contained" color="primary" className={classes.generateButton}>
                Generate Report
            </Button>
            {report && <Report report={report} />}
            {nssdr.length > 0 && (
                <>
                    <Typography variant="h4" className={classes.header}>
                        NSSDR
                    </Typography>
                    <InventoryTable columns={columns} rows={nssdr} classes={classes} />
                </>
            )}
            {tsa.length > 0 && (
                <>
                    <Typography variant="h4" className={classes.header}>
                        TSA1
                    </Typography>
                    <InventoryTable columns={columns} rows={tsa} classes={classes} />
                </>
            )}
        </Box>
    );
};

export default InventoryRectification;
