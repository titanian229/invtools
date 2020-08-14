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

import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';

const SearchResultRow = (props) => {
    const { row, columns } = props;

    return (
        <TableRow>
            {columns.map((column) => (
                <TableCell key={column.id}>{row[column.id]}</TableCell>
            ))}
        </TableRow>
    );
};

export default SearchResultRow;
