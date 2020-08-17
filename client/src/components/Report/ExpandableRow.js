import React, { useState } from 'react';
import {
    TableRow,
    TableCell,
    Collapse,
    IconButton,
    Box,
    Typography,
    Table,
    TableHead,
    TableBody,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';

const formatDate = (date) => {
    let dateObj = new Date(date)
    return `${dateObj.getFullYear()}/${dateObj.getMonth() + 1}/${dateObj.getDate()}`
}


const useStyles = makeStyles((theme) => ({
    root: {},
}));

const ExpandableRow = (props) => {
    const { row, columns } = props;
    const classes = useStyles();
    const [open, setOpen] = useState(false);
    return (
        <>
            <TableRow className={classes.root}>
                <TableCell style={{maxWidth: '3ch'}}>
                    <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>

                {/* <TableRow hover role="checkbox" tabIndex={-1} key={row.localItemNumber}> */}
                {columns.map((column) => (
                    <TableCell key={column}>{row[column]}</TableCell>
                ))}
                {/* </TableRow> */}
            </TableRow>

            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box margin={1}>
                            {/* <Typography variant="h6" gutterBottom component="div">
                                History
                            </Typography> */}
                            <Table size="small" aria-label="history">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Invoice</TableCell>
                                        <TableCell align="right">Qty</TableCell>
                                        <TableCell align="right">$</TableCell>
                                        <TableCell align="left">Date</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {row.invoices.map((historyRow) => (
                                        <TableRow key={historyRow.date}>
                                            <TableCell>{historyRow.invoiceNumber}</TableCell>
                                            <TableCell align="right">{historyRow.qty}</TableCell>
                                            <TableCell align="right">
                                                {historyRow.dollarAmount}
                                            </TableCell>
                                            <TableCell component="th" scope="row">
                                                {formatDate(historyRow.date)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
};

export default ExpandableRow;
