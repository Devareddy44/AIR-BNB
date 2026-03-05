const express = require("express");
const router = express.Router({mergeParams : true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema } = require("../schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

const validateReview = (req, res, next) => {
  let result = reviewSchema.validate(req.body);

  if (result.error) {
    let errMsg = result.error.details.map(el => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

//Reviews
//POST Review Route
const { isLoggedIn, isReviewAuthor } = require("../middleware.js");

const reviewcontroller = require("../controllers/reviews.js");


router.post("/",
  isLoggedIn,        // ✅ ADD THIS
  validateReview,
  wrapAsync(reviewcontroller.createReview));

// Delete Review Route
router.delete("/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(reviewcontroller.destroyReview));

module.exports = router;