const fs = require('fs');
const multer = require('multer');
const sharp = require('sharp');
const cloudinary = require('./../utils/cloudinary');
const catchAsync = require('./../utils/catchAsync');
const Tour = require('./../models/tourModel');

if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

async function uploadToCloudinary(localFilePath) {
  const mainFolderName = 'tour-app';

  const filePathOnCloudinary = mainFolderName + '/' + localFilePath;

  return cloudinary.uploader
    .upload(localFilePath, { public_id: filePathOnCloudinary })
    .then((result) => {
      fs.unlinkSync(localFilePath);

      return {
        message: 'Success',
        url: result.secure_url,
        public_id: result.public_id
      };
    })
    .catch((error) => {
      fs.unlinkSync(localFilePath);
      return { message: 'Fail' };
    });
}

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 }
]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  const imageCover = `uploads/tour-${Date.now()}-cover`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(imageCover);

  const imageCoverResult = await uploadToCloudinary(imageCover);

  req.body.imageCover = imageCoverResult.url;
  req.body.imageCoverPublicId = imageCoverResult.public_id;

  req.body.images = [];
  req.body.imagesPublicId = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `uploads/tour-${Date.now()}-${i + 1}`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(filename);

      const imagesResult = await uploadToCloudinary(filename);

      req.body.images.push(imagesResult.url);
      req.body.imagesPublicId.push(imagesResult.public_id);
    })
  );

  next();
});

exports.createTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.create(req.body);
  res.status(201).json(tour);
});

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

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  if (tour) {
    tour.name = req.body.name;
    tour.price = req.body.price;
    tour.stops = req.body.stops;
    tour.duration = req.body.duration;
    tour.difficulty = req.body.difficulty;
    tour.summary = req.body.summary;
    tour.description = req.body.description;
    if (req.body.startDates.length !== 0) {
      tour.startDates = [];
      for (let index = 0; index < req.body.startDates.length; index++) {
        tour.startDates[index] = req.body.startDates[index];
      }
    }
    tour.startLocation = req.body.startLocation;
    tour.maxGroupSize = req.body.maxGroupSize;
  } else {
    res.status(404).json({
      status: 'Not Found',
      message: 'No tour found with that ID'
    });
  }

  try {
    const updatedTour = tour.save();
    res.status(200).json(updatedTour);
  } catch (err) {
    res.status(400).json({
      status: 'Bad Request',
      message: err.message
    });
  }
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
