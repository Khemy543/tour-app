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
  uploadUserPhoto,
  resizeUserPhoto,
} = require('../controllers/authController');

const router = express.Router();

// auth routes
router.post('/signup', signup);

router.post('/login', login);

router.post('/forgot-password', forgotPassword);

router.patch('/reset-password/:token', resetPassword);

// protect all route after this middleware
router.use(protectRoute);

router.patch('/change-password', changePassword);

router
  .route('/user')
  .get(getAuthUser)
  .patch(uploadUserPhoto, resizeUserPhoto, updateAuthUser)
  .delete(deleteAuthUSer);

module.exports = router;
