import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { createMuiTheme, makeStyles, ThemeProvider } from '@material-ui/core/styles';
import Home from './pages/Home'
import './App.css'
// Page imports


const theme = createMuiTheme({
    palette: {
        primary: {
            main: '#297B48',
        },
        secondary: {
            main: '#AA4D39',
        },  
    },
    typography: {
        h4: {
            fontFamily: 'Gentium Basic'
        },
        fontFamily: 'Raleway'

    }
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

function App() {
    return (
        <ThemeProvider theme={theme}>
            <Router>
                <Switch>
                    <Route exact path='/'>
                        <Home />
                    </Route>
                </Switch>
            </Router>
            <div className="App"></div>
        </ThemeProvider>
    );
}

export default App;
