import React, { useState, useEffect, useRef } from 'react';
import {
    Container,
    Grid,
    TextField,
    Button,
    InputAdornment,
    IconButton,
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import clsx from 'clsx';

import API from '../utils/API';

import SearchResult from '../components/SearchResult';

const useStyles = makeStyles((theme) => ({
    searchContainer: {
        // height: 300,
        height: '100%',
        // width: '100%',
        backgroundColor: 'rgba(41,123,72, 0.5)',
        borderRadius: 8,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        padding: theme.spacing(2),
        // padding: theme.spacing(4),
        // backgroundColor: 'red',
    },
    searchContainerContainer: {
        padding: theme.spacing(2),
        // height: '30vh',
    },
    mainContainer: {
        backgroundImage: 'url(/images/pexels-min-an-1353938.jpg)',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        minHeight: '100vh',
    },
    subtitle: {
        marginBottom: theme.spacing(2),
    },
    tableRoot: {
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
    },
}));

// const returnedSearchFiller = [
//     {
//         localItemNumber: 1101494,
//         foreignItemNumber: 4056,
//         foreignManufacturerName: 'Michelin',
//     },
//     {
//         localItemNumber: 142065,
//         foreignItemNumber: 3069000,
//         foreignManufacturerName: 'Pirelli',
//     },
// ];

// DATA
// COLUMNS ResultNumber LocalIN ForeignIN ManufacName
const columns = [
    // {
    //     id: 'resultNumber',
    //     label: 'Result',
    //     minWidth: 50,
    // },
    {
        id: 'localItemNumber',
        label: 'Local IN',
        minWidth: 186,
    },
    {
        id: 'foreignItemNumber',
        label: 'Manufacturer IN',
        minWidth: 186,
    },
    {
        id: 'foreignManufacturerName',
        label: 'Manufacturer',
        minWidth: 150,
    },
];

const Search = () => {
    const classes = useStyles();
    // PUT IN LOADING BACKDROP FOR SEARCH
    const [loading, setLoading] = useState(false);
    const [unitaryResult, setUnitaryResult] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(12);

    const initialState = {
        search: '',
    };
    const [values, setValues] = useState(initialState);

    const handleChange = (prop) => (event) => {
        setValues({ ...values, [prop]: event.target.value });
    };

    const handleSearchSubmit = async () => {
        // event.preventDefault()
        console.log(values.search);
        if (values.search === ''){
            setSearchResults([])
            return
        }

        const serverReturn = await API.getSearch(values.search);
        const { results, message, error } = serverReturn;
        if (error) {
            console.log(error);
            return;
        }
        
        if (serverReturn.unitaryResult){
            setUnitaryResult(serverReturn.unitaryResult)
        } else {
            setUnitaryResult(null)
        }

        // console.log(message);
        setSearchResults(results);


    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleSearchSubmit();
            return;
        }
        // TRY SEARCH ON EACH KEYPRESS
    };

    const handleKeyUp = () => {
        handleSearchSubmit()
    }

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    return (
        <div className={classes.mainContainer}>
            <div className={classes.searchContainerContainer}>
                <Box
                    className={classes.searchContainer}
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                >
                    <Typography variant="subtitle2" align="center" className={classes.subtitle}>
                        Search for an item number
                    </Typography>
                    <TextField
                        className={classes.input}
                        fullWidth
                        focused
                        type='number'
                        label="Item Number Search"
                        variant="outlined"
                        value={values.search}
                        onChange={handleChange('search')}
                        onKeyDown={handleKeyDown}
                        onKeyUp={handleKeyUp}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton aria-label="search" onClick={handleSearchSubmit}>
                                        <SearchIcon />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>
            </div>
            {unitaryResult && <SearchResult {...unitaryResult} />}
            {searchResults.length > 0 && (
                <Paper className={classes.tableRoot}>
                    <TableContainer className={classes.tableContainer}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    {columns.map((column) => (
                                        <TableCell key={column.id}>{column.label}</TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {searchResults
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((row) => (
                                        <TableRow hover role="checkbox" tabIndex={-1} key={row.localItemNumber}>
                                            {columns.map((column) => (
                                                <TableCell key={column.id}>{row[column.id]}</TableCell>
                                            ))}
                                        </TableRow>
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
            )}

            {/* <Container className={classes.resultsContainer} maxWidth="sm">
                {returnedSearchFiller.map((result) => (
                    <SearchResult {...result} />
                ))}
            </Container> */}
        </div>
    );
};

export default Search;
