const express = require('express');
const {
  getAllUsers,
  getUser,
  deleteUser,
  updateUser,
} = require('../controllers/userController');
const { protectRoute, restrictTo } = require('../controllers/authController');

const router = express.Router();

// user routes
router.route('/').get(getAllUsers);

router
  .route('/:id')
  .get(protectRoute, restrictTo('admin'), getUser)
  .patch(protectRoute, restrictTo('admin'), updateUser)
  .delete(protectRoute, restrictTo('admin'), deleteUser);

module.exports = router;
