require('dotenv').config();
const express = require('express');
const routes = require('./routes');
const mongoose = require('mongoose');
const logger = require('morgan');
const bodyParser = require('body-parser');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const uuid = require('uuid').v4;

//AUTH
const app = express();
const PORT = process.env.PORT || 3001;

const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// app.use(logger(":method :url :status :res[content-length] - :response-time ms"));
app.use(logger('dev'));

app.use(cors());
app.use(helmet());
app.use(compression());
app.use(bodyParser.json());


app.use(express.static('client/build'));
app.get('/invinput', (req, res) => {
    res.sendFile('client/build/invInput.html', { root: __dirname });
});
app.get('*', (req, res) => {
    res.sendFile('client/build/index.html', { root: __dirname });
});
app.use(routes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`App listening on PORT ${PORT}`);
});
