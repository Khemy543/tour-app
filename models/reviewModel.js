const mongoose = require('mongoose');
const Tour = require('./tourModel');

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

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: 'user', select: 'name' });
  next();
});

//static methods
reviewSchema.statics.calculateAverageRatings = async function (tourId) {
  //this points to Review model
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        ratingsQuantity: { $sum: 1 },
        ratingsAverage: { $avg: '$rating' },
      },
    },
  ]);
  await Tour.findByIdAndUpdate(tourId, stats[0]);
};

reviewSchema.post('save', function () {
  // this.constructor points to the current review
  this.constructor.calculateAverageRatings(this.tour);
});

/* reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.reviewData = await this.findOne(); // returns the not updated review data
  next();
}); */

reviewSchema.post(/^findOneAnd/, (doc) => {
  if (doc) {
    doc.constructor.calculateAverageRatings(doc.tour); //call the static method on the reviewData
  }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
