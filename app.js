const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema } = require("./schema.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// --------------------
// DB Connection
// --------------------
async function main() {
  await mongoose.connect(MONGO_URL);
}
main()
  .then(() => console.log("connected to DB"))
  .catch(err => console.log(err));

// --------------------
// View Engine Setup
// --------------------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// --------------------
// Middleware
// --------------------
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// --------------------
// Joi Validation Middleware
// --------------------
const validateListing = (req, res, next) => {
  let result = listingSchema.validate(req.body);

  if (result.error) {
    let errMsg = result.error.details.map(el => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// --------------------
// Routes
// --------------------

// Root
app.get("/", (req, res) => {
  res.send("Hi I am root");
});

// INDEX
app.get("/listings", wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index", { allListings });
}));

// NEW
app.get("/listings/new", (req, res) => {
  res.render("listings/new");
});

// CREATE
app.post("/listings",
  validateListing,
  wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body);
    await newListing.save();
    res.redirect("/listings");
}));

// SHOW
app.get("/listings/:id", wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    throw new ExpressError(404, "Listing not found");
  }

  res.render("listings/show", { listing });
}));

// EDIT
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    throw new ExpressError(404, "Listing not found");
  }

  res.render("listings/edit", { listing });
}));

// UPDATE
app.put("/listings/:id",
  validateListing,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const updated = await Listing.findByIdAndUpdate(id, req.body);

    if (!updated) {
      throw new ExpressError(404, "Listing not found");
    }

    res.redirect(`/listings/${id}`);
}));

// DELETE
app.delete("/listings/:id", wrapAsync(async (req, res) => {
  const { id } = req.params;
  const deleted = await Listing.findByIdAndDelete(id);

  if (!deleted) {
    throw new ExpressError(404, "Listing not found");
  }

  res.redirect("/listings");
}));

// --------------------
// 404 Handler
// --------------------
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

// --------------------
// Error Handler
// --------------------
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something Went Wrong!" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

// --------------------
// Server
// --------------------
app.listen(8080, () => {
  console.log("server is listening to port 8080");
});
