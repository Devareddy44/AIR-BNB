const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn , isOwner, validateListing } = require("../middleware.js");


// INDEX
router.get("/", wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index", { allListings });
}));

// NEW
router.get("/new", isLoggedIn , (req, res) => {
  res.render("listings/new");
});

// CREATE
router.post("/",
  isLoggedIn,
  validateListing,
  wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success" , "New Listing Created!");
    res.redirect("/listings");
}));

// SHOW
router.get("/:id", wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id).populate({path: "reviews", populate: {
    path: "author",},
  }).populate("owner");

  if (!listing) {
    req.flash("error" , "Listing Not Exist!");
    return res.redirect("/listings");
  }

  res.render("listings/show", { listing });
}));

// EDIT
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error" , "Listing Not Exist!");
    return res.redirect("/listings");
  }

  res.render("listings/edit", { listing });
}));

// UPDATE
router.put("/:id",
  isLoggedIn,
  isOwner,
  validateListing,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const updated = await Listing.findByIdAndUpdate(id, req.body);

    if (!updated) {
      throw new ExpressError(404, "Listing not found");
    }

    req.flash("success" , "Listing Updated!");
    res.redirect(`/listings/${id}`);
}));

// DELETE
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
  const { id } = req.params;
  const deleted = await Listing.findByIdAndDelete(id);

  if (!deleted) {
    throw new ExpressError(404, "Listing not found");
  }

  req.flash("success" , "Listing Deleted!");

  res.redirect("/listings");
}));

module.exports = router;