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

const useStyles = makeStyles((theme) => ({
    root: {

    },
    
}));

const SearchResultRow = (props) => {
    const { row, columns } = props;
    const classes = useStyles();
    const [open, setOpen] = useState(false);

    return (
        <>
            <TableRow className={classes.root}>
                <TableCell>
                    <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                {/* <TableRow hover role="checkbox" tabIndex={-1} key={row.localItemNumber}> */}
                    {columns.map((column) => (
                        <TableCell key={column.id}>{row[column.id]}</TableCell>
                    ))}
                {/* </TableRow> */}
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box margin={1}>
                            {/* <Typography variant="h6" gutterBottom component="div">
                                Item Information
                            </Typography> */}
                            <Typography variant="subtitle1">{row.info}</Typography>
                            <Typography variant="subtitle1">{row.note}</Typography>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
};

export default SearchResultRow;
