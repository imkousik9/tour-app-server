const express = require('express');
const bookingController = require('./../controllers/bookingController');
const isAuth = require('./../middleware/isAuth');

const router = express.Router();

router.get('/slot', bookingController.getSlot);

router.post('/verification', bookingController.verification);

router.use(isAuth);
router.get('/', bookingController.getBookings);
router.post('/order', bookingController.createPayment);

module.exports = router;
