const mongoose = require("mongoose");
const slugify = require("slugify");
const playlistSchema = new mongoose.Schema(
  {
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
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);
// playlistSchema.pre(/^find$/, function (next) {
//   this.populate({
//     path: "music",
//     select: "-__v",
//   });

//   next();
// });

// playlistSchema.pre("save", function (next) {
//   this.slug = slugify(this.name, { lower: true });
//   this.keyword = this.slug;
//   next();
// });

const Playlist = mongoose.model("Playlist", playlistSchema);
module.exports = Playlist;
