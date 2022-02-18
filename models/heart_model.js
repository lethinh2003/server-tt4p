const mongoose = require("mongoose");
const slugify = require("slugify");
const heartSchema = new mongoose.Schema({
  user: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Missing user"],
    },
  ],
  music: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Music",
      required: [true, "Missing music"],
    },
  ],
});

// heartSchema.pre("save", function (next) {
//   this.slug = slugify(this.name, { lower: true });
//   this.keyword = this.slug;
//   next();
// });
// heartSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: "music",
//     select: "-__v",
//   });

//   next();
// });

const Heart = mongoose.model("Heart", heartSchema);
module.exports = Heart;
