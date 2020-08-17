import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import { makeStyles } from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import BugReportIcon from '@material-ui/icons/BugReport';

const useStyles = makeStyles((theme) => ({
    bottomNav: {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
    },
}));

const BottomNav = () => {
    const classes = useStyles();
    const [value, setValue] = useState(0);
    const history = useHistory()
    return (
        <BottomNavigation
            value={value}
            onChange={(event, newValue) => {
                
                setValue(newValue);
            }}
            showLabels
            className={classes.bottomNav}
        >
            <BottomNavigationAction label="Search" component={Link} to="/" icon={<SearchIcon />} />
            <BottomNavigationAction label="NSSDR/TSA1" component={Link} to="/report" icon={<BugReportIcon />} />
        </BottomNavigation>
    );
};

export default BottomNav;
