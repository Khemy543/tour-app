const express = require('express');

const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  changePassword,
  protectRoute,
  getAuthUser,
  updateAuthUser,
  deleteAuthUSer,
} = require('../controllers/authController');

const router = express.Router();

// auth routes
router.post('/signup', signup);

router.post('/login', login);

router.post('/forgot-password', forgotPassword);

router.patch('/reset-password/:token', resetPassword);

router.patch('/change-password', protectRoute, changePassword);

router
  .route('/user')
  .get(protectRoute, getAuthUser)
  .patch(protectRoute, updateAuthUser)
  .delete(protectRoute, deleteAuthUSer);

module.exports = router;
