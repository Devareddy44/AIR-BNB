const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });
const ExpressError = require("../utils/ExpressError");

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new");
};

module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id).populate({path: "reviews", populate: {
    path: "author",},
  }).populate("owner");

  if (!listing) {
    req.flash("error" , "Listing Not Exist!");
    return res.redirect("/listings");
  }

  res.render("listings/show", { listing });
};


module.exports.createListing = async (req, res) => {

  let response = await geocodingClient.forwardGeocode({
    query: `${req.body.listing.location}, ${req.body.listing.country}`,
    limit: 1
  }).send();

  const newListing = new Listing(req.body.listing);

  newListing.owner = req.user._id;

  newListing.geometry = response.body.features[0].geometry;

  if (req.file) {
    newListing.image = {
      url: req.file.path,
      filename: req.file.filename
    };
  }

  await newListing.save();

  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

module.exports.renderEditForm= async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error" , "Listing Not Exist!");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload" , "/upload/w_250")
  res.render("listings/edit", { listing , originalImageUrl });
};


module.exports.updateListing = async (req, res) => {
  const { id } = req.params;

  let listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  // update listing fields
  Object.assign(listing, req.body.listing);

  // ⭐ regenerate coordinates for new location
  const geoResponse = await geocodingClient.forwardGeocode({
    query: `${listing.location}, ${listing.country}`,
    limit: 1
  }).send();

  listing.geometry = geoResponse.body.features[0].geometry;

  // update image if uploaded
  if (req.file) {
    listing.image = {
      url: req.file.path,
      filename: req.file.filename
    };
  }

  await listing.save();

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${listing._id}`);
};


module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;
  const deleted = await Listing.findByIdAndDelete(id);

  if (!deleted) {
    throw new ExpressError(404, "Listing not found");
  }

  req.flash("success" , "Listing Deleted!");

  res.redirect("/listings");
};