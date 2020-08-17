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
    smallerFont: {
        fontSize: '0.7em'
    }
}));

const ExpandableRow = (props) => {
    const { row, columns } = props;
    const classes = useStyles();
    const [open, setOpen] = useState(false);
    return (
        <>
            <TableRow className={classes.root}>
                <TableCell style={{width: '3ch'}}>
                    <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>

                {/* <TableRow hover role="checkbox" tabIndex={-1} key={row.localItemNumber}> */}
                {/* {columns.map((column) => (
                    <TableCell key={column}>{row[column]}</TableCell>
                ))} */}
                <TableCell style={{width: '10ch'}}>{row.itemNumber}</TableCell>
                <TableCell style={{width: '3ch'}}>{row.qty}</TableCell>
                <TableCell style={{width: '9ch'}}>{row.dollarAmount}</TableCell>
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
                                        <TableCell className={classes.smallerFont}>Invoice</TableCell>
                                        <TableCell className={classes.smallerFont} align="right">Qty</TableCell>
                                        <TableCell className={classes.smallerFont} align="right">$</TableCell>
                                        <TableCell className={classes.smallerFont} align="left">Date</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {row.invoices.map((historyRow) => (
                                        <TableRow key={historyRow.date}>
                                            <TableCell className={classes.smallerFont}>{historyRow.invoiceNumber}</TableCell>
                                            <TableCell className={classes.smallerFont} align="right">{historyRow.qty}</TableCell>
                                            <TableCell className={classes.smallerFont} align="right">
                                                {historyRow.dollarAmount}
                                            </TableCell>
                                            <TableCell className={classes.smallerFont} component="th" scope="row">
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
