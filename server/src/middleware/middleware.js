const cors = require('cors');
const express = require('express');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const xss = require('xss-clean');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');

module.exports = (app) => {
  app.use(express.json());

  app.use(
    cors({
      origin: ['http://localhost:5173'],
      methods: ['GET', 'POST', 'PUT', 'OPTIONS', 'DELETE', 'PATCH'],
      credentials: true,
    })
  );
  const mode = 'development';
  if (mode === 'development') {
    app.use(morgan('dev'));
  }

  const limiter = rateLimit({
    max: 100,
    windowMs: 1 * 60 * 1000,
    message: 'Too many Requests from this IP, please try again in 2 minute !',
  });
  app.use('/api', limiter);

  app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));

  app.use(xss());

  app.use(mongoSanitize());

  app.use(compression());
};
