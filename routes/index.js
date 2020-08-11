const express = require('express');
const fs = require('fs');
const path = require('path');
const basename = path.basename(module.filename);

const router = express.Router();

fs.readdirSync(__dirname)
    .filter((file) => {
        return file.indexOf('.' !== 0) && file !== basename && file.slice(-3) === '.js';
    })
    .forEach((route) => require(path.join(__dirname, route))(router));

module.exports = router;
