import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { createMuiTheme, makeStyles, ThemeProvider } from '@material-ui/core/styles';

import './App.css';

// Page imports
import Home from './pages/Home';
import Search from './pages/Search';
import InvRect from './pages/InventoryRectification'

import BottomNav from './components/BottomNav';

const theme = createMuiTheme({
    palette: {
        primary: {
            main: '#297B48',
        },
        secondary: {
            main: '#d81b60',
        },
    },
    typography: {
        h4: {
            fontFamily: 'Gentium Basic',
        },
        fontFamily: 'Raleway',
    },
    // breakpoints: {
    //     values: {
    //         xs: 0,
    //         sm: 700,
    //         md: 960,
    //         lg: 1280,
    //         xl: 1920,
    //     },
    // },
});

const useStyles = makeStyles((theme) => ({
    mainApp: {
        paddingBottom: 50,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
    },
}));

function App() {
    const classes = useStyles();
    return (
        <ThemeProvider theme={theme}>
            <div className={classes.mainApp}>
                <Router>
                    <Switch>
                        <Route exact path="/">
                            <Search />
                        </Route>
                        <Route exact path="/report">
                            <InvRect />
                        </Route>
                        {/* <Route exact path='/'>
                        <Home />
                    </Route> */}
                    </Switch>
                    <BottomNav />
                </Router>
            </div>
            {/* <div className="App"></div> */}
        </ThemeProvider>
    );
}

export default App;
