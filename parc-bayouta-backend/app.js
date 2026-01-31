const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./routes');

const app = express();

// Security HTTP headers
app.use(helmet());

// Parse json request body
app.use(express.json());

// Parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// Enable cors
app.use(cors());

// Logger
app.use(morgan('dev'));

// Api routes
app.use('/api', routes);

// Send 404 error for unknown api requested
app.use((req, res, next) => {
    res.status(404).send({ message: 'Not found' });
});

// Generic error handler
app.use((err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).send({ message });
});

module.exports = app;
