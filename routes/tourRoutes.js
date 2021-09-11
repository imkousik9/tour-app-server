const express = require('express');
const tourController = require('./../controllers/tourController');
const isAuth = require('./../middleware/isAuth');

const router = express.Router();

router.get('/', tourController.getTours);

router.get('/:slug', tourController.getTour);

router.use(isAuth);
router.post('/', tourController.createTour);
router.route('/:id').delete(tourController.deleteTour);

module.exports = router;
