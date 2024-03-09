const express = require('express');
const app = express();

const authRouter = require('./src/routes/authRoutes');
const errorController = require('./src/middleware/errorController');
const initAllMiddleware = require('./src/middleware/middleware');
const postRouter = require('./src/routes/postRoutes');
const userRouter = require('./src/routes/userRoutes');

initAllMiddleware(app);

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/post', postRouter);
app.use('/api/v1/user', userRouter);

app.use(errorController);

module.exports = app;
