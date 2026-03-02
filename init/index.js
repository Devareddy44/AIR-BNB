const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
  await mongoose.connect(MONGO_URL);
  console.log("connected to DB");
}

const initDB = async () => {
  await Listing.deleteMany({});

  const user = await User.findOne();

  if (!user) {
    console.log("❌ No user found. Create a user first.");
    return;
  }

  console.log("✅ Using user:", user.username);

  const updatedData = initData.data.map((obj) => ({
    ...obj,
    owner: user._id,
  }));

  await Listing.insertMany(updatedData);

  console.log("✅ Data initialized successfully");
};

main().then(initDB);