const express = require('express');
const helmet = require('helmet');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./routes');

const app = express();

// Security HTTP headers
app.use(helmet({
    crossOriginResourcePolicy: false,
}));

// Parse json request body
app.use(express.json());

// Parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// Enable cors
app.use(cors());

// Logger
app.use(morgan('dev'));
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Api routes
app.use('/api', routes);

// Serve static files from uploads directory
const uploadsPath = path.join(__dirname, 'uploads');
app.use('/uploads', cors(), express.static(uploadsPath));

// Send 404 error for unknown api requested
app.use((req, res, next) => {
    res.status(404).send({ message: 'Not found' });
});

// Generic error handler
app.use((err, req, res, next) => {
    console.error("ERROR:", err);
    res.status(err.statusCode || 500).send({
        message: err.message || "Internal Server Error",
        // Optionnel pour debug:
        // stack: err.stack,
    });
});


module.exports = app;
