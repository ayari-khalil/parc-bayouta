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
    next(new ApiError(404, 'Not found'));
});



module.exports = app;
