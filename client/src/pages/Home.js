import React, { useState, useEffect, useRef } from 'react';
import { Container, Grid, TextField, Button, InputAdornment, IconButton, Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Person, Visibility, VisibilityOff, Lock } from '@material-ui/icons';
import clsx from 'clsx';
import './Home.css';

const useStyles = makeStyles((theme) => ({
    loginBoxContainer: {
        // marginTop: 60
        height: '100vh',
        // backgroundColor: 'black',
        backgroundImage: 'url(images/mattia-righetti-gbBWpX2sXmU-unsplash.jpg)',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
    },
    title: {
        position: 'absolute',
        top: theme.spacing(1),
        left: theme.spacing(2),
        right: theme.spacing(2),
        textAlign: 'center',
    },
    loginBox: {
        width: 600,
        height: 400,
        // outline: '1px solid orange',
    },
    loginContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        padding: theme.spacing(4),
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        // borderRadius: 8,
        // border: 2,
        // borderColor: theme.palette.secondary.main,
        width: '100%',
        margin: theme.spacing(0, 2),
        position: 'relative'
    },
    loginNeighbourContainer: {
        // backgroundColor: 'black',
        outline: '1px solid blue',
    },
    input: {
        margin: theme.spacing(0, 2, 2),
        width: '100%',
    },
    loginButton: {
        margin: theme.spacing(4, 0, 0),
    },
}));

const Home = () => {
    const classes = useStyles();
    const initialState = {
        password: '',
        username: '',
        showPassword: false,
    };
    const [values, setValues] = useState(initialState);
    const handleChange = (prop) => (event) => {
        setValues({ ...values, [prop]: event.target.value });
    };

    // const handleClickShowPassword = () => {
    //     setValues({ ...values, showPassword: !values.showPassword });
    // };

    // const handleMouseDownPassword = (event) => {
    //     event.preventDefault();
    // };

    return (
        <Grid className={classes.loginBoxContainer} container justify="center" alignItems="center">
            <Grid className={clsx(classes.loginBox, 'backdropBlur')} container direction="row">
                <Box className={classes.loginContainer} border={2} borderColor='secondary.main' borderRadius={8} >
                    {/* <Grid className={classes.loginContainer} item xs={12}> */}
                    <Typography className={classes.title} variant='h4'>TC Tools</Typography>
                    {/* <Typography variant='subtitle2'>by James</Typography> */}
                    <TextField
                        className={classes.input}
                        label="username"
                        variant="outlined"
                        value={values.username}
                        onChange={handleChange('username')}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <Person />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <TextField
                        className={classes.input}
                        label="password"
                        variant="outlined"
                        type={values.showPassword ? 'text' : 'password'}
                        value={values.password}
                        onChange={handleChange('password')}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    {/* <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={handleClickShowPassword}
                                        onMouseDown={handleMouseDownPassword}
                                        >
                                        {values.showPassword ? <Visibility /> : <VisibilityOff />}
                                    </IconButton> */}
                                    <Lock />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button className={classes.loginButton} variant="contained" color="primary">
                        Log in
                    </Button>
                    {/* </Grid> */}
                </Box>
            </Grid>
        </Grid>
    );
};

export default Home;
