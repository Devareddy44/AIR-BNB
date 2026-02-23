const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },

  description: String,

  image: {
    filename: {
      type: String,
      default: "listingimage",
    },
    url: {
      type: String,
      default:
        "https://static.vecteezy.com/system/resources/previews/012/168/187/large_2x/beautiful-sunset-on-the-beach-with-palm-tree-for-travel-and-vacation-free-photo.JPG",
      set: (v) =>
        v === ""
          ? "https://static.vecteezy.com/system/resources/previews/012/168/187/large_2x/beautiful-sunset-on-the-beach-with-palm-tree-for-travel-and-vacation-free-photo.JPG"
          : v,
    },
  },

  price: Number,
  location: String,
  country: String,
});

// ✅ FIX IS HERE
const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;
