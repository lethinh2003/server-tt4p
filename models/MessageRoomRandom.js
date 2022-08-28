const mongoose = require("mongoose");

const messageRoomRandomSchema = new mongoose.Schema(
  {
    room: {
      type: String,
      trim: true,
      required: [true, "Missing room"],
    },
    from: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Missing account from"],
    },
    to: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Missing account to"],
    },
    msg: {
      type: String,
      trim: true,
      required: [true, "Missing msg"],
    },
  },
  {
    collection: "chat_message_room_random",
    timestamps: true,
  }
);
messageRoomRandomSchema.pre(/^find/, function (next) {
  this.populate({
    path: "from",
    select:
      "-__v -password -resetPasswordToken -resetPasswordTokenExpires -role -updatedPasswordAt -findSex -emailActiveTokenExpires -emailActiveToken -email -city -bio -active_email -date",
    populate: {
      path: "avatarSVG",
      model: "AvatarUser",
      select: "-user",
    },
  });
  this.populate({
    path: "to",
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

const MessageRoomRandom =
  mongoose.models.MessageRoomRandom || mongoose.model("MessageRoomRandom", messageRoomRandomSchema);
module.exports = MessageRoomRandom;
