import React from 'react';
import { Paper, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    resultContainer: {
        padding: theme.spacing(2),
        margin: theme.spacing(0, 2, 2),
        textAlign: 'center',
    },
}));

const SearchResult = (props) => {
    const classes = useStyles();
    const { localItemNumber, foreignItemNumber, foreignManufacturerName } = props;
    return (
        <Paper className={classes.resultContainer} elevation={3}>
            <Typography variant="subtitle">
                {localItemNumber} - {foreignItemNumber}
            </Typography>
            <Typography variant="subtitle2">{foreignManufacturerName}</Typography>
        </Paper>
    );
};

export default SearchResult;
