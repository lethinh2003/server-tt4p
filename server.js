const mongoose = require("mongoose");
const dotenv = require("dotenv");

const ChatRoom = require("./models/ChatRoom");

const http = require("http");

const app = require("./app");

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
    origin: process.env.CLIENT_SOCKET,
  },
});
const { joinListUsers, findPartner, removeUser, getUsersWaiting } = require("./room");
io.on("connection", (socket) => {
  console.log("New client connected " + socket.id);
  const getUsersWaitingData = getUsersWaiting();
  io.emit("update-users-waiting-room", getUsersWaitingData);
  socket.on("check-user-in-room", (user) => {
    const checkUser = joinListUsers(user);
    if (checkUser === false) {
      removeUser(user);
    }
    const getUsersWaitingData = getUsersWaiting();
    io.emit("update-users-waiting-room", getUsersWaitingData);
  });

  socket.on("join-list-users", async (user) => {
    const data = joinListUsers(user);
    console.log(data);
    const getUsersWaitingData = getUsersWaiting();
    io.emit("update-users-waiting-room", getUsersWaitingData);

    if (data) {
      socket.chatAPPUser = data;
      //Join room by user account
      socket.join(user.account);
      await ChatRoom.create({
        account: socket.chatAPPUser.account,
        type: "waiting",
      });
      console.log("ROOM:", io.sockets.adapter.rooms);
      const getUsersWaitingData = getUsersWaiting();
      io.emit("update-users-waiting-room", getUsersWaitingData);
    }
  });
  socket.on("out-chat-room", async (partner) => {
    await ChatRoom.deleteOne({
      account: partner.account,
      type: "chatting",
    });
    await ChatRoom.deleteOne({
      account: socket.chatAPPUser.account,
      type: "chatting",
    });
    removeUser(partner);
    removeUser(socket.chatAPPUser);
    const currentRoom1 = `${partner.account}-${socket.chatAPPUser.account}`;
    const currentRoom2 = `${socket.chatAPPUser.account}-${partner.account}`;
    socket.leave(currentRoom1);
    socket.leave(currentRoom2);
    io.sockets.in(currentRoom1).emit("out-chat-room-for-partner", socket.chatAPPUser);
    io.sockets.in(currentRoom2).emit("out-chat-room-for-partner", socket.chatAPPUser);
    io.sockets
      .in(currentRoom1)
      .emit("send-noti-disconnected-for-partner", "Đối phương đã rời phòng chat, phòng của bạn sẽ đóng cửa!!");
    io.sockets
      .in(currentRoom2)
      .emit("send-noti-disconnected-for-partner", "Đối phương đã rời phòng chat, phòng của bạn sẽ đóng cửa!!");
    socket.chatAPPUserPartner = null;
    const getUsersWaitingData = getUsersWaiting();
    io.emit("update-users-waiting-room", getUsersWaitingData);
  });
  socket.on("out-waiting-room", async () => {
    await ChatRoom.deleteOne({
      account: socket.chatAPPUser.account,
      type: "waiting",
    });
    removeUser(socket.chatAPPUser);
    socket.leave(socket.chatAPPUser.account);
    console.log("ROOM:", io.sockets.adapter.rooms);
    const getUsersWaitingData = getUsersWaiting();
    io.emit("update-users-waiting-room", getUsersWaitingData);
  });
  socket.on("join-room-for-partner", (partner) => {
    socket.join(`${partner.account}-${socket.chatAPPUser.account}`);
    socket.chatAPPUserPartner = partner;
    console.log("ROOM:", io.sockets.adapter.rooms);
  });
  socket.on("find-partner", (currentUser) => {
    setTimeout(async () => {
      const data = findPartner(currentUser);
      console.log("ROOM:", io.sockets.adapter.rooms);
      console.log(data);

      //send message find partner for current user
      io.sockets.in(currentUser.account).emit("find-partner", data);
      //find partner success
      if (data.status === "success") {
        console.log("data", data);
        await ChatRoom.deleteOne({
          account: socket.chatAPPUser.account,
          type: "waiting",
        });
        await ChatRoom.deleteOne({
          account: data.partner.account,
          type: "waiting",
        });
        await ChatRoom.create({
          account: data.partner.account,
          type: "chatting",
        });
        await ChatRoom.create({
          account: socket.chatAPPUser.account,
          type: "chatting",
        });
        socket.chatAPPUserPartner = data.partner;
        socket.join(`${socket.chatAPPUser.account}-${data.partner.account}`);

        //send request join room for partner
        io.sockets.in(data.partner.account).emit("join-room-for-partner", data);
        //send info current user for partner
        io.sockets.in(data.partner.account).emit("find-partner-success", data);
        //send info partner for current user
        io.sockets.in(data.user.account).emit("find-partner-success", data);
      }
    }, 2000);
  });
  socket.on("receive-disconnected-for-partner", (data) => {
    const { currentRoom1, currentRoom2 } = data;
    socket.leave(currentRoom1);
    socket.leave(currentRoom2);
    console.log("ROOM:", io.sockets.adapter.rooms);
  });
  socket.on("send-chat-content", (message) => {
    const newMessage = {
      account: socket.chatAPPUser.account,
      name: socket.chatAPPUser.name,
      message: message,
      sex: socket.chatAPPUser.sex,
    };
    const currentRoom1 = `${socket.chatAPPUserPartner.account}-${socket.chatAPPUser.account}`;
    const currentRoom2 = `${socket.chatAPPUser.account}-${socket.chatAPPUserPartner.account}`;
    io.sockets.to(currentRoom1).emit("receive-chat-content", newMessage);
    io.sockets.in(currentRoom2).emit("receive-chat-content", newMessage);
    //send sound notify
    io.sockets.in(socket.chatAPPUserPartner.account).emit("receive-chat-sound");
  });
  socket.on("chat-typing", (data) => {
    const currentRoom1 = `${socket.chatAPPUserPartner.account}-${socket.chatAPPUser.account}`;
    const currentRoom2 = `${socket.chatAPPUser.account}-${socket.chatAPPUserPartner.account}`;
    if (data === true) {
      const mes = { status: true, message: "Đối phương đang nhập ..." };
      //Send room1 or room2, except sender
      socket.to(currentRoom1).emit("chat-typing", mes);
      socket.to(currentRoom2).emit("chat-typing", mes);
    } else {
      const mes = { status: false, message: "Đối phương đã huỷ nhập" };
      //Send room1 or room2, except sender
      socket.to(currentRoom1).emit("chat-typing", mes);
      socket.to(currentRoom2).emit("chat-typing", mes);
    }
  });

  socket.on("disconnecting", async () => {
    console.log("disconenting", socket.chatAPPUser);

    if (socket.chatAPPUser) {
      await ChatRoom.deleteOne({
        account: socket.chatAPPUser.account,
      });
      removeUser(socket.chatAPPUser);
    }
    if (socket.chatAPPUserPartner && socket.chatAPPUser) {
      await ChatRoom.deleteOne({
        account: socket.chatAPPUserPartner.account,
      });
      io.sockets
        .in(socket.chatAPPUserPartner.account)
        .emit("send-noti-disconnected-for-partner", "Đối phương đã tắt kết nối, phòng của bạn sẽ đóng cửa!!");
      removeUser(socket.chatAPPUserPartner);

      const currentRoom1 = `${socket.chatAPPUserPartner.account}-${socket.chatAPPUser.account}`;
      const currentRoom2 = `${socket.chatAPPUser.account}-${socket.chatAPPUserPartner.account}`;
      io.sockets
        .in(socket.chatAPPUserPartner.account)
        .emit("send-disconnected-for-partner", { currentRoom1, currentRoom2 });

      io.sockets.in(currentRoom1).emit("disconnected-for-partner");
      io.sockets.in(currentRoom2).emit("disconnected-for-partner");
      console.log("ROOM:", io.sockets.adapter.rooms);

      socket.chatAPPUserPartner = null;
      socket.chatAPPUser = null;
    }
  });
  socket.on("disconnect", () => {
    console.log("Client disconnected ", socket.id);
    console.log("ROOM:", io.sockets.adapter.rooms);
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
