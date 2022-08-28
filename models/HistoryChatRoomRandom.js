const mongoose = require("mongoose");

const historyChatRoomRandomSchema = new mongoose.Schema(
  {
    account: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Missing account"],
    },
    partner: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Missing partner"],
    },
    room: {
      type: String,
      trim: true,
      required: [true, "Missing room"],
    },
  },
  {
    collection: "history_chat_room_random",
    timestamps: true,
  }
);
historyChatRoomRandomSchema.pre(/^find/, function (next) {
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

const HistoryChatRoomRandom =
  mongoose.models.HistoryChatRoomRandom || mongoose.model("HistoryChatRoomRandom", historyChatRoomRandomSchema);
module.exports = HistoryChatRoomRandom;
