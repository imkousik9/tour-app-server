const express = require('express');
const path = require('path');
const cors = require('cors');
const Redis = require('ioredis');
const session = require('express-session');
const connectRedis = require('connect-redis');

const userRouter = require('./routes/userRoutes');
const tourRouter = require('./routes/tourRoutes');
const bookingRouter = require('./routes/bookingRoutes');

const app = express();

app.set('trust proxy', 1);
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
  })
);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

const URL = {
  port: process.env.REDIS_PORT,
  host: process.env.REDIS_URL,
  password: process.env.REDIS_PASSWORD
};

const RedisStore = connectRedis(session);
const redis = new Redis(URL);

app.use(
  session({
    name: process.env.COOKIE_NAME,
    store: new RedisStore({
      client: redis,
      disableTouch: true
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * process.env.COOKIE_EXPIRES_IN,
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production'
    },
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET,
    resave: false
  })
);

app.use('/tours', express.static(path.join(__dirname, 'public', 'tours')));

app.use('/api/users', userRouter);
app.use('/api/tours', tourRouter);
app.use('/api/bookings', bookingRouter);

module.exports = app;
