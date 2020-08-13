import React, { useState, useEffect, useRef } from 'react';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Collapse,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import SearchIcon from '@material-ui/icons/Search';
import clsx from 'clsx';

import SearchResultRow from './SearchResultRow';

const useStyles = makeStyles((theme) => ({
    tableRoot: {
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
    },
}));

const SearchResultsTable = (props) => {
    const { columns, searchResults } = props;
    const classes = useStyles();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(12);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    return (
        <Paper className={classes.tableRoot}>
            <TableContainer className={classes.tableContainer}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell />
                            {columns.map((column) => (
                                <TableCell key={column.id}>{column.label}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {/* {searchResults.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                            <TableRow hover role="checkbox" tabIndex={-1} key={row.localItemNumber}>
                                {columns.map((column) => (
                                    <TableCell key={column.id}>{row[column.id]}</TableCell>
                                ))}
                            </TableRow>
                        ))} */}
                        {searchResults.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                            <SearchResultRow key={row.localItemNumber} row={row} columns={columns} />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[12, 24, 100]}
                component="div"
                count={searchResults.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onChangePage={handleChangePage}
                onChangeRowsPerPage={handleChangeRowsPerPage}
            />
        </Paper>
    );
};

export default SearchResultsTable;
