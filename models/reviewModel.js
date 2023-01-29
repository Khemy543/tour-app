const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'review message is required'],
    },
    rating: {
      type: Number,
      min: [1, 'Ratings must not be less than 1'],
      max: [5, 'Ratings must not be greater than 5'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      required: [true, 'Tour id is required'],
      ref: 'Tour',
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.pre(/^find/, function (next) {
  /* this.populate({
    path: 'tour',
    select: 'name',
  }).populate({ path: 'user', select: 'name' }); */
  this.populate({ path: 'user', select: 'name' });
  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
