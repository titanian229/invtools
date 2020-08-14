require('dotenv').config();
const mongoose = require('mongoose');
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
const db = require('../models');

const rectify = async () => {
    
    // DATA I WANT OUT\
    //



    // Create list of items present in NSSDR and not TSA




    mongoose.connection.close()
};

rectify();
