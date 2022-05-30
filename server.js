const mongoose = require("mongoose");
const dotenv = require("dotenv");

const ChatRoom = require("./models/ChatRoom");
const PostComment = require("./models/PostComment");
const Post = require("./models/Post");

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
const { findPartnerRandom, removeUserRandom, joinListUsersRandom, getUsersWaitingRandom } = require("./roomRandom");
io.on("connection", (socket) => {
  console.log("New client connected " + socket.id);
  console.log("ROOM:", io.sockets.adapter.rooms);
  //Send list users waiting room
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

  //Join room personal: account
  socket.on("join-room-unique-account", (account) => {
    socket.join(`${account}-room`);
    console.log("ROOM:", io.sockets.adapter.rooms);
  });

  ///ROOM RANDOM VIP///

  socket.on("join-list-users", async (user) => {
    const data = joinListUsers(user);
    if (data) {
      socket.chatAPPUser = data;
      //Join room by user account
      socket.join(user.account);
      await ChatRoom.create({
        account: socket.chatAPPUser.account,
        type: "waiting",
      });
    }
    //update user in room
    const getUsersWaitingData = getUsersWaiting();
    io.emit("update-users-waiting-room", getUsersWaitingData);
  });

  socket.on("find-partner", async (currentUser) => {
    const data = findPartner(currentUser);
    //send message find partner for current user
    io.sockets.in(currentUser.account).emit("find-partner", data);
    //find partner success
    if (data.status === "success") {
      socket.chatAPPUserPartner = data.partner;
      //Convert status from waiting to chatting
      await Promise.all([
        ChatRoom.findOneAndUpdate(
          {
            account: socket.chatAPPUser.account,
          },
          {
            type: "chatting",
          }
        ),
        ChatRoom.findOneAndUpdate(
          {
            account: socket.chatAPPUserPartner.account,
          },
          {
            type: "chatting",
          }
        ),
      ]);
      //update user in room
      const getUsersWaitingData = getUsersWaiting();
      io.emit("update-users-waiting-room", getUsersWaitingData);
      // create and join room both 2 users:
      const roomGeneral = `${socket.chatAPPUser.account}-${process.env.GENERAL_KEY_CHAT}-${data.partner.account}-randomVip`;
      socket.join(roomGeneral);
      socket.roomRandomVip = roomGeneral;
      //send auto request join room for partner
      io.sockets.in(socket.chatAPPUserPartner.account).emit("join-room-for-partner", { partner: data.user });
      //send info current user for partner
      io.sockets
        .in(socket.chatAPPUserPartner.account)
        .emit("find-partner-success", { partner: data.user, message: data.message });
      //send info partner for current user
      io.sockets
        .in(socket.chatAPPUser.account)
        .emit("find-partner-success", { partner: data.partner, message: data.message });
    }
  });

  socket.on("join-room-for-partner", (partner) => {
    const roomGeneral = `${partner.account}-${process.env.GENERAL_KEY_CHAT}-${socket.chatAPPUser.account}-randomVip`;
    socket.join(roomGeneral);
    socket.chatAPPUserPartner = partner;
    socket.roomRandomVip = roomGeneral;
    console.log("ROOM nek:", io.sockets.adapter.rooms);
  });

  socket.on("out-chat-room", async (partner) => {
    await Promise.all([
      ChatRoom.deleteOne({
        account: partner.account,
      }),
    ]);
    console.log("out-chat-room", "partner: ", partner.account, "account: ", socket.chatAPPUser.account);
    //remove users from list users in room
    removeUser(partner);
    removeUser(socket.chatAPPUser);

    //leave room general (room1 or room2), I don't know exactly what they in.
    console.log("ROOM pre:", io.sockets.adapter.rooms);
    socket.leave(socket.roomRandomVip);

    console.log("ROOM next:", io.sockets.adapter.rooms);

    io.sockets
      .in(socket.roomRandomVip)
      .emit("send-noti-disconnected-for-partner", "Đối phương đã rời phòng chat, phòng của bạn sẽ đóng cửa!!");
    io.sockets.in(socket.roomRandomVip).emit("out-chat-room-for-partner", socket.chatAPPUser);
    socket.chatAPPUserPartner = null;
    socket.roomRandomVip = null;
    //update user in room
    const getUsersWaitingData = getUsersWaiting();
    io.emit("update-users-waiting-room", getUsersWaitingData);
  });
  /// END ROOM VIP

  //ROOM RANDOM///

  socket.on("join-list-users-random", async (user) => {
    const data = joinListUsersRandom(user);
    if (data) {
      socket.chatAPPUser = data;
      //Join room by user account
      socket.join(user.account);
      await ChatRoom.create({
        account: socket.chatAPPUser.account,
        type: "waiting",
      });
    }
    //update user in room
    const getUsersWaitingData = getUsersWaitingRandom();
    io.emit("update-users-waiting-room-random", getUsersWaitingData);
  });

  socket.on("find-partner-random", async (currentUser) => {
    const data = findPartnerRandom(currentUser);
    //send message find partner for current user
    io.sockets.in(currentUser.account).emit("find-partner-random", data);
    //find partner success
    if (data.status === "success") {
      socket.chatAPPUserPartner = data.partner;
      //Convert status from waiting to chatting
      await Promise.all([
        ChatRoom.findOneAndUpdate(
          {
            account: socket.chatAPPUser.account,
          },
          {
            type: "chatting",
          }
        ),
        ChatRoom.findOneAndUpdate(
          {
            account: socket.chatAPPUserPartner.account,
          },
          {
            type: "chatting",
          }
        ),
      ]);
      //update user in room
      const getUsersWaitingData = getUsersWaitingRandom();
      io.emit("update-users-waiting-room-random", getUsersWaitingData);
      // create and join room both 2 users:
      const roomGeneral = `${socket.chatAPPUser.account}-${process.env.GENERAL_KEY_CHAT}-${data.partner.account}`;
      socket.join(roomGeneral);
      socket.roomRandom = roomGeneral;
      //send auto request join room for partner
      io.sockets.in(socket.chatAPPUserPartner.account).emit("join-room-for-partner-random", { partner: data.user });
      //send info current user for partner
      io.sockets
        .in(socket.chatAPPUserPartner.account)
        .emit("find-partner-success-random", { partner: data.user, message: data.message });
      //send info partner for current user
      io.sockets
        .in(socket.chatAPPUser.account)
        .emit("find-partner-success-random", { partner: data.partner, message: data.message });
    }
  });

  socket.on("join-room-for-partner-random", (partner) => {
    const roomGeneral = `${partner.account}-${process.env.GENERAL_KEY_CHAT}-${socket.chatAPPUser.account}`;
    socket.join(roomGeneral);
    socket.chatAPPUserPartner = partner;
    socket.roomRandom = roomGeneral;
    console.log("ROOM nek:", io.sockets.adapter.rooms);
  });

  socket.on("out-chat-room-random", async (partner) => {
    await Promise.all([
      ChatRoom.deleteOne({
        account: partner.account,
      }),
    ]);
    console.log("out-chat-room-random", "partner: ", partner.account, "account: ", socket.chatAPPUser.account);
    //remove users from list users in room
    removeUserRandom(partner);
    removeUserRandom(socket.chatAPPUser);

    //leave room general (room1 or room2), I don't know exactly what they in.
    console.log("ROOM pre:", io.sockets.adapter.rooms);
    socket.leave(socket.roomRandom);

    console.log("ROOM next:", io.sockets.adapter.rooms);

    io.sockets
      .in(socket.roomRandom)
      .emit("send-noti-disconnected-for-partner-random", "Đối phương đã rời phòng chat, phòng của bạn sẽ đóng cửa!!");
    io.sockets.in(socket.roomRandom).emit("out-chat-room-for-partner-random", socket.chatAPPUser);
    socket.chatAPPUserPartner = null;
    socket.roomRandom = null;
    //update user in room
    const getUsersWaitingData = getUsersWaitingRandom();
    io.emit("update-users-waiting-room-random", getUsersWaitingData);
  });
  //END ROOM RANDOM//

  socket.on("request-info-partner", (partner) => {
    io.sockets.in(partner.account).emit("request-info-partner");
  });
  socket.on("notify-request-info-partner", (data) => {
    console.log(socket.chatAPPUserPartner.account);
    io.sockets.in(socket.chatAPPUserPartner.account).emit("notify-request-info-partner", data);
  });

  socket.on("receive-disconnected-for-partner", (roomRandom) => {
    socket.leave(roomRandom);
    console.log("ROOM:", io.sockets.adapter.rooms);
  });
  socket.on("receive-disconnected-for-partner-random", (roomRandom) => {
    socket.leave(roomRandom);
    console.log("ROOM:", io.sockets.adapter.rooms);
  });
  socket.on("send-chat-content", (message) => {
    const newMessage = {
      account: socket.chatAPPUser.account,
      name: socket.chatAPPUser.name,
      message: message,
      sex: socket.chatAPPUser.sex,
    };
    console.log(newMessage);
    const currentRoom = socket.roomRandom || socket.roomRandomVip;
    io.sockets.to(currentRoom).emit("receive-chat-content", newMessage);
    //send sound notify
    io.sockets.in(socket.chatAPPUserPartner.account).emit("receive-chat-sound");
  });
  socket.on("chat-typing", (data) => {
    const currentRoom1 = `${socket.chatAPPUserPartner.account}-${process.env.GENERAL_KEY_CHAT}-${socket.chatAPPUser.account}`;
    const currentRoom2 = `${socket.chatAPPUser.account}-${process.env.GENERAL_KEY_CHAT}-${socket.chatAPPUserPartner.account}`;
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
  socket.on("banned-account", ({ account, status }) => {
    console.log("send room banned account");
    io.to(`${account}-room`).emit("banned-account", status);
  });

  socket.on("out-waiting-room", async () => {
    await ChatRoom.deleteOne({
      account: socket.chatAPPUser.account,
      type: "waiting",
    });
    removeUser(socket.chatAPPUser);
    socket.leave(socket.chatAPPUser.account);
    socket.chatAPPUser = null;
    console.log("ROOM:", io.sockets.adapter.rooms);
    //update users in room
    const getUsersWaitingData = getUsersWaiting();
    io.emit("update-users-waiting-room", getUsersWaitingData);
  });
  socket.on("out-waiting-room-random", async () => {
    await ChatRoom.deleteOne({
      account: socket.chatAPPUser.account,
      type: "waiting",
    });
    removeUserRandom(socket.chatAPPUser);
    socket.leave(socket.chatAPPUser.account);
    socket.chatAPPUser = null;
    console.log("ROOM:", io.sockets.adapter.rooms);
    //update users in room
    const getUsersWaitingData = getUsersWaitingRandom();
    io.emit("update-users-waiting-room-random", getUsersWaitingData);
  });

  //// Post Comment
  socket.on("join-post-room", (data) => {
    socket.join(`post_${data._id}`);
    console.log("ROOM:", io.sockets.adapter.rooms);
  });
  socket.on("typing-post-comment", ({ room, value }) => {
    socket.to(room).emit("typing-post-comment", value);
  });
  socket.on("create-post-comment", (data) => {
    console.log(data.room);
    io.to(data.room).emit("create-post-comment");
  });

  socket.on("disconnecting", async () => {
    console.log("disconenting", socket.chatAPPUser);
    if (socket.chatAPPUser) {
      await ChatRoom.deleteOne({
        account: socket.chatAPPUser.account,
      });
      removeUser(socket.chatAPPUser);
      removeUserRandom(socket.chatAPPUser);
      //update list users in room
      const getUsersWaitingData = getUsersWaiting();
      io.emit("update-users-waiting-room", getUsersWaitingData);
      const getUsersWaitingDataRandom = getUsersWaitingRandom();
      io.emit("update-users-waiting-room-random", getUsersWaitingDataRandom);
      //Check if have the partner (chatting)
      if (socket.chatAPPUserPartner) {
        await ChatRoom.deleteOne({
          account: socket.chatAPPUserPartner.account,
        });
        io.sockets
          .in(socket.chatAPPUserPartner.account)
          .emit("send-noti-disconnected-for-partner", "Đối phương đã tắt kết nối, phòng của bạn sẽ đóng cửa!!");
        io.sockets
          .in(socket.chatAPPUserPartner.account)
          .emit("send-noti-disconnected-for-partner-random", "Đối phương đã tắt kết nối, phòng của bạn sẽ đóng cửa!!");
        removeUser(socket.chatAPPUserPartner);
        removeUserRandom(socket.chatAPPUserPartner);
        //update list users in room
        const getUsersWaitingData = getUsersWaiting();
        io.emit("update-users-waiting-room", getUsersWaitingData);
        const getUsersWaitingDataRandom = getUsersWaitingRandom();
        io.emit("update-users-waiting-room-random", getUsersWaitingDataRandom);
        const currentRoom1 = `${socket.chatAPPUserPartner.account}-${socket.chatAPPUser.account}`;
        const currentRoom2 = `${socket.chatAPPUser.account}-${socket.chatAPPUserPartner.account}`;
        if (socket.roomRandomVip) {
          io.sockets.in(socket.chatAPPUserPartner.account).emit("send-disconnected-for-partner", socket.roomRandom);
          io.sockets.in(socket.roomRandomVip).emit("disconnected-for-partner");
          socket.leave(socket.roomRandomVip);
        }
        if (socket.roomRandom) {
          io.sockets
            .in(socket.chatAPPUserPartner.account)
            .emit("send-disconnected-for-partner-random", socket.roomRandom);
          io.sockets.in(socket.roomRandom).emit("disconnected-for-partner-random");
          socket.leave(socket.roomRandom);
        }
      }
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
