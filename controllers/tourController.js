const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');

exports.getTours = catchAsync(async (req, res, next) => {
  const tours = await Tour.find().lean();

  if (!tours) {
    res.status(404).json({
      status: 'Not Found',
      message: 'No tours found'
    });
  }

  res.status(200).json(tours);
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).lean();

  if (!tour) {
    res.status(404).json({
      status: 'Not Found',
      message: 'No tour found with that slug'
    });
  }

  res.status(200).json(tour);
});

exports.createTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.create(req.body);
  res.status(201).json(tour);
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    res.status(404).json({
      status: 'Not Found',
      message: 'No tour found with that ID'
    });
  }

  res.status(204).json({ data: null });
});
