const User = require('../models/userModel');
const {
  deleteResource,
  updateResource,
  getResouceById,
  getAllResouces,
} = require('./handlerFactoryController');

exports.getAllUsers = getAllResouces(User);

exports.getUser = getResouceById(User);

exports.updateUser = updateResource(User);

exports.deleteUser = deleteResource(User);
