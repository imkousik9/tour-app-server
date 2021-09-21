const crypto = require('crypto');
const Razorpay = require('razorpay');
const shortid = require('shortid');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY__SECRET
});

const Booking = require('../models/bookingModel');
const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');

exports.createPayment = catchAsync(async (req, res, next) => {
  const { tourId, startDate } = req.body;

  const tour = await Tour.findById(tourId);

  const options = {
    amount: tour.price * 100,
    currency: 'INR',
    receipt: shortid.generate(),
    payment_capture: 1
  };

  try {
    const response = await razorpay.orders.create(options);

    await Booking.create({
      OrderId: response.id,
      tour: tourId,
      user: req.user.id,
      startDate: startDate
    });

    res.status(200).json({
      id: response.id,
      currency: response.currency,
      amount: response.amount
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ statusCode: 500, message: error.message });
  }
});

exports.verification = async (req, res) => {
  const secret = process.env.WEBHOOK_SECRET;

  const shasum = crypto.createHmac('sha256', secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest('hex');

  const id = req.body.payload.order.entity.id;

  if (digest === req.headers['x-razorpay-signature']) {
    if (req.body.event === 'order.paid') {
      const amount = req.body.payload.order.entity.amount_paid;

      await Booking.updateOne(
        { OrderId: id },
        {
          price: amount / 100
        }
      );
    } else {
      await Booking.deleteOne({ OrderId: id });
    }
  } else {
    await Booking.deleteOne({ OrderId: id });
    res.json({ status: 'fail' });
  }
  res.json({ status: 'ok' });
};

exports.getBookings = catchAsync(async (req, res, next) => {
  const user = req.user.role === 'admin' ? {} : { user: req.user.id };
  const bookings = await Booking.find(user)
    .sort({
      createdAt: -1
    })
    .lean();

  if (!bookings) {
    res.status(404).json({
      status: 'Not Found',
      message: 'No bookings found with that ID'
    });
  }

  res.status(200).json(bookings);
});

exports.getSlot = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.query.slug }).lean();
  const bookings = await Booking.find({
    startDate: req.query.startDate
  }).lean();

  res.status(200).json(tour.maxGroupSize > bookings.length);
});
