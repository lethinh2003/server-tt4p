const mongoose = require("mongoose");

const chatRoomRandomSchema = new mongoose.Schema(
  {
    account: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Missing account"],
    },
    partner: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    room: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      trim: true,
    },
  },
  {
    collection: "chat_room_random",
    timestamps: true,
  }
);
chatRoomRandomSchema.pre(/^find/, function (next) {
  this.populate({
    path: "account",
    select:
      "-__v -password -resetPasswordToken -resetPasswordTokenExpires -role -updatedPasswordAt -findSex -emailActiveTokenExpires -emailActiveToken -email -city -bio -active_email -date",
    populate: {
      path: "avatarSVG",
      model: "AvatarUser",
      select: "-user",
    },
  });
  this.populate({
    path: "partner",
    select:
      "-__v -password -resetPasswordToken -resetPasswordTokenExpires -role -updatedPasswordAt -findSex -emailActiveTokenExpires -emailActiveToken -email -city -bio -active_email -date",
    populate: {
      path: "avatarSVG",
      model: "AvatarUser",
      select: "-user",
    },
  });
  next();
});

const ChatRoomRandom = mongoose.models.ChatRoomRandom || mongoose.model("ChatRoomRandom", chatRoomRandomSchema);
module.exports = ChatRoomRandom;
