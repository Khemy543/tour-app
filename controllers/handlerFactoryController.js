const ApiFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAync = require('../utils/catchAync');

exports.deleteResource = (Model) =>
  catchAync(async (req, res, next) => {
    const resource = await Model.findByIdAndDelete(req.params.id);

    if (!resource) {
      return next(new AppError('No resource found', 404));
    }

    res.status(204).json({
      success: true,
      data: null,
    });
  });

exports.updateResource = (Model) =>
  catchAync(async (req, res, next) => {
    const resource = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!resource) {
      return next(new AppError('No resource found', 404));
    }

    res.status(200).json({
      success: true,
      data: resource,
    });
  });

exports.createResource = (Model) =>
  catchAync(async (req, res, next) => {
    const resource = await Model.create(req.body);

    res.status(201).json({
      success: true,
      data: resource,
    });
  });

exports.getResouceById = (Model, populateOptions) =>
  catchAync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptions) query = query.populate(populateOptions);
    const resource = await query;

    if (!resource) {
      return next(new AppError('No resource found', 404));
    }

    res.status(200).json({
      success: true,
      data: resource,
    });
  });

exports.getAllResouces = (Model) =>
  catchAync(async (req, res, next) => {
    const features = new ApiFeatures(Model, req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const resource = await features.query;

    res.status(200).json({
      success: true,
      data: resource,
    });
  });
