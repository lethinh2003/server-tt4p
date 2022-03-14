const mongoose = require("mongoose");
const dotenv = require("dotenv");
var express = require("express");
const axios = require("axios");
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

// const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD);
// mongoose
//   .connect(DB, {
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useFindAndModify: false,
//     useUnifiedTopology: true,
//   })
//   .then(() => {
//     console.log("DB connected");
//   });

const port = process.env.PORT || 8080;
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});
let allUser = [];
io.on("connection", (socket) => {
  console.log("New client connected " + socket.id);
  socket.on("join-room", (data) => {
    socket.leave(socket.room_code);
    socket.join(data);
    socket.room_code = data;
  });
  socket.on("get-all-comments", async (codeId) => {
    try {
      const results = await axios.get(`${process.env.CLIENT_SOCKET}/api/source-code/comments/${codeId}`);
      io.sockets.in(codeId).emit("send-all-comments", results.data.data);
    } catch (err) {
      console.log(err);
    }
  });
  socket.on("disconnecting", () => {
    socket.leave(socket.room_code);
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
