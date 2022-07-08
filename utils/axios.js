const axios = require('axios');

const instance = axios.create({
  baseURL: process.env.CORS_ORIGIN
});

module.exports = instance;
