const express = require('express');
const tourController = require('./../controllers/tourController');
const isAuth = require('./../middleware/isAuth');
const isAdmin = require('../middleware/isAdmin');

const router = express.Router();

router.get('/', tourController.getTours);

router.get('/:slug', tourController.getTour);

router.use(isAuth);
router.use(isAdmin);
router.post(
  '/',
  tourController.uploadTourImages,
  tourController.resizeTourImages,
  tourController.createTour
);
router
  .route('/:id')
  .delete(tourController.deleteTour)
  .patch(tourController.updateTour);

module.exports = router;
