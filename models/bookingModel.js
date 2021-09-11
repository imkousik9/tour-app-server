const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  OrderId: {
    type: String,
    required: [true, 'Payment Id is missing']
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Booking must belong to a Tour!']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a User!']
  },
  startDate: Date,
  price: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

bookingSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'tour',
    select: ['name', 'imageCover', 'summary', 'difficulty', 'duration']
  });
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
