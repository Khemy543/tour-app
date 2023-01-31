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
//protect and restrict access router after this middle to only admin
router.use(protectRoute, restrictTo('admin'));
router.route('/').get(getAllUsers);

router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
