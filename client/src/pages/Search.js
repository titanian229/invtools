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
    Collapse,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import clsx from 'clsx';

import API from '../utils/API';

import SearchResult from '../components/SearchResult';
import SearchResultsTable from '../components/SearchResultsTable'

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
        // minHeight: '100vh',
        flexGrow: 1,
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
        label: 'Manufac IN',
        minWidth: 186,
    },
    {
        id: 'foreignManufacturerName',
        label: 'Manufac',
        minWidth: 150,
    },
];

// TODO add in messages to user on failure from the server
// TODO add in search restrictions, checks for limiting by manufac
// TODO add in info descriptions for notes and whatnot from DB

const Search = () => {
    const classes = useStyles();
    // PUT IN LOADING BACKDROP FOR SEARCH
    const [loading, setLoading] = useState(false);
    const [unitaryResult, setUnitaryResult] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    

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
        if (values.search === '') {
            setSearchResults([]);
            return;
        }

        const serverReturn = await API.getSearch(values.search);
        const { results, message, error } = serverReturn;
        if (error) {
            console.log(error);
            return;
        }

        if (serverReturn.unitaryResult) {
            setUnitaryResult(serverReturn.unitaryResult);
        } else {
            setUnitaryResult(null);
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
        handleSearchSubmit();
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
                        type="number"
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
                <SearchResultsTable columns={columns} searchResults={searchResults} />
            )}

        </div>
    );
};

export default Search;
