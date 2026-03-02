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

router.post("/",
  isLoggedIn,        // ✅ ADD THIS
  validateReview,
  wrapAsync(async(req, res) => {

    let listing = await Listing.findById(req.params.id);

    if(!listing){
      throw new ExpressError(404,"Listing not found");
    }

    let newReview = new Review(req.body.review);

    newReview.author = req.user._id;  // ✅ FIXED

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    req.flash("success" , "New Review Created!");
    res.redirect(`/listings/${listing._id}`);
}));

// Delete Review Route
router.delete("/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(async(req,res) => {
    let {id, reviewId} = req.params;

    await Listing.findByIdAndUpdate(id , {$pull : {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);

    req.flash("success" , "Review Deleted!");
    res.redirect(`/listings/${id}`);
}));

module.exports = router;