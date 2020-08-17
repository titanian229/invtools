import React, { useState } from 'react';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableSortLabel,
    TableRow,
    Collapse,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import ExpandableRow from './ExpandableRow';

const overviewColumns = [
    {
        id: 'itemNumber',
        label: 'Item Number',
        minWidth: 150,
    },
    {
        id: 'qty',
        label: 'Qty',
        minWidth: 150,
    },
    {
        id: 'dollarAmount',
        label: 'Amount',
        minWidth: 150,
    },
]


const Report = (props) => {
    const { overviewReport, finalReport } = props.report
    return (
        <div>
            {/* <TableContainer component={Paper}>
                <Table aria-label="overview table">
                    <TableHead>
                        <TableRow>
                            {overviewColumns.map((column) => (
                                <TableCell key={column.id}>{column.label}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {overviewReport.map((row, ind) => (
                            <ExpandableRow key={ind} row={row} columns={overviewColumns} expandContent={row.date} />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer> */}
            <TableContainer component={Paper}>
                {/* TODO refactor to use columns array of obs, with width set */}
                <Table aria-label="full report table">
                    <TableHead>
                        <TableRow>
                            <TableCell  style={{width: '3ch'}} />
                            <TableCell>Item #</TableCell>
                            <TableCell>Qty</TableCell>
                            <TableCell>$</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {finalReport.map((row, ind) => (
                            <ExpandableRow key={ind} row={row} columns={['itemNumber', 'qty', 'dollarAmount']} />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default Report;

// TODO Add in search in NSSDR and TSA values, search by inv, item
// TODO print report function
// TODO sort table by date, highlight things at either end as suspect, +numbers at the end and -at the start
// TODO for search show date range of earliest and latest
