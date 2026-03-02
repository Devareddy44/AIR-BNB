const mongoose = require("mongoose");
const { Schema } = mongoose;

// Fix for Node 24 CommonJS behavior
let passportLocalMongoose = require("passport-local-mongoose");

if (typeof passportLocalMongoose !== "function") {
  passportLocalMongoose = passportLocalMongoose.default;
}

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);