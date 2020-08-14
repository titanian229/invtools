require('dotenv').config();
const mongoose = require('mongoose');
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
const db = require('../models');

const rectify = async () => {
    
    const uniqueItemNumbers = await db.TSA.distinct('itemNumber')
    console.log("rectify -> uniqueItemNumbers", uniqueItemNumbers)




    mongoose.connection.close()
};

rectify();
