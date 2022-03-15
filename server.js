const mongoose = require("mongoose");
const dotenv = require("dotenv");
var express = require("express");
const axios = require("axios");
const Notify = require("./models/Notify");
const Comment = require("./models/Comment");
const http = require("http");

var app = express();

const server = http.createServer(app);

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.log("Error: ", err);
  console.log(err.name, err.message);
  process.exit(1);
});
dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE;
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB connected");
  });

const port = process.env.PORT || 8080;
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});
let allUser = [];
io.on("connection", (socket) => {
  console.log("New client connected " + socket.id);
  socket.on("join-room-history-likes", (userId) => {
    socket.leave(socket.room_history_likes);
    socket.join(userId);
    socket.room_history_likes = userId;
  });
  socket.on("send-room-history-likes", (userId) => {
    io.sockets.in(userId).emit("send-room-history-likes");
  });
  socket.on("join-notify", (data) => {
    socket.leave(socket.room_notify);
    socket.join(data);
    socket.room_notify = data;
  });
  socket.on("get-notify", async (data) => {
    try {
      const findNotifies = await Notify.find({
        account_receive: { $in: [data] },
      })
        .sort("-_id")
        .select("-__v")
        .populate({
          path: "account_receive",
          select: "-__v -password",
        })
        .populate({
          path: "account_send",
          select: "-__v -password",
        });
      io.sockets.in(data).emit("send-notify", findNotifies);
    } catch (err) {
      console.log(err);
    }
  });
  socket.on("read-notify", async (data) => {
    try {
      await Notify.updateMany(
        {
          account_receive: { $in: [data] },
        },
        { status: true }
      );
      io.sockets.in(data).emit("read-notify");
    } catch (err) {
      console.log(err);
    }
  });
  socket.on("join-room", (data) => {
    socket.leave(socket.room_code);
    socket.join(data);
    socket.room_code = data;
  });
  socket.on("get-all-comments", async (codeId) => {
    try {
      const results = await Comment.find({
        code: codeId,
      })
        .populate({
          path: "user",
          select: "-__v -password",
        })
        .populate({
          path: "reply",
          select: "-__v -password",
        })

        .sort("-_id")
        .select("-__v");
      io.sockets.in(codeId).emit("send-all-comments", results);
    } catch (err) {
      console.log(err);
    }
  });
  socket.on("disconnecting", () => {
    socket.leave(socket.room_code);
    socket.leave(socket.room_history_likes);
    socket.leave(socket.room_notify);
  });
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});
server.listen(port, () => {
  console.log("Server đang chay tren cong 3000");
});
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log("Error: ", err);
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
