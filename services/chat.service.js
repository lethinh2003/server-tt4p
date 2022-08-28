const ChatRoom = require("../models/ChatRoom");
const ChatRoomRandom = require("../models/ChatRoomRandom");
const HistoryChatRoomRandom = require("../models/HistoryChatRoomRandom");
const Message = require("../models/Message");
const MessageRoomRandom = require("../models/MessageRoomRandom");
const PostComment = require("../models/PostComment");
const Notify = require("../models/Notify");
const User = require("../models/User");
const {
  findPartnerRandom,
  removeUserRandom,
  joinListUsersRandom,
  getUsersWaitingRandom,
  joinListUsersChatting,
} = require("../roomRandom");

class SocketServices {
  connection(socket) {
    console.log("New client connected " + socket.id);
    console.log("ROOM:", _io.sockets.adapter.rooms);
    //Join room personal: account
    socket.on("join-room-unique-account", (account) => {
      socket.join(`${account}-room`);
      console.log("ROOM:", _io.sockets.adapter.rooms);
    });

    socket.on("join-list-users-random", async (callback) => {
      try {
        const user = socket.userIO;
        const updateUser = await User.findOne({
          account: user.account,
        })
          .select("role status name account sex createdAt following followers avatar partners messages avatarSVG")
          .populate({
            path: "avatarSVG",
            select: "-__v -user -_id",
          });
        const userJoinRooms = await joinListUsersRandom(updateUser);

        if (userJoinRooms) {
          const dataSocket = {
            userStatus: "waiting",
            user: userJoinRooms,
            userIO: userJoinRooms,
            room: null,
            partner: null,
            partnerIO: null,
          };
          socket.chatRandom = dataSocket;
          socket.join(user.account);
          console.log("JOIN", socket.chatRandom);
          await ChatRoomRandom.findOneAndUpdate(
            {
              account: socket.chatRandom.user._id,
            },
            {
              status: "waiting",
            }
          );
        }
        //update user in room
        const getUsersWaitingData = getUsersWaitingRandom();
        _io.emit("update-users-waiting-room-random", getUsersWaitingData);
        console.log("ROOM AFTER JOIN LIST USERS", _io.sockets.adapter.rooms);
        callback({
          status: "ok",
        });
      } catch (err) {
        callback({
          status: "err",
        });
      }
    });

    socket.on("find-partner-random", async () => {
      const currentUser = socket.chatRandom.userIO;
      const dataFindPartner = findPartnerRandom(currentUser);
      console.log("FIND", dataFindPartner);
      if (dataFindPartner) {
        //send message find partner for current user
        _io.sockets.in(currentUser.account).emit("find-partner-random", dataFindPartner);
        //find partner success
        if (dataFindPartner.status === "success") {
          const updateDatabase = await Promise.all([
            ChatRoomRandom.updateOne(
              {
                account: dataFindPartner.user._id,
              },
              {
                partner: dataFindPartner.partner._id,
                room: dataFindPartner.room,
                status: "chatting",
              }
            ),
            ChatRoomRandom.updateOne(
              {
                account: dataFindPartner.partner._id,
              },
              {
                partner: dataFindPartner.user._id,
                room: dataFindPartner.room,
                status: "chatting",
              }
            ),
            HistoryChatRoomRandom.create({
              account: dataFindPartner.user._id,
              partner: dataFindPartner.partner._id,
              room: dataFindPartner.room,
            }),
            HistoryChatRoomRandom.create({
              account: dataFindPartner.partner._id,
              partner: dataFindPartner.user._id,
              room: dataFindPartner.room,
            }),
          ]);
          await Promise.all([
            User.updateOne(
              {
                account: dataFindPartner.user.account,
              },
              {
                $push: { chatRandom: updateDatabase[2]._id },
              }
            ),
            User.updateOne(
              {
                account: dataFindPartner.partner.account,
              },
              {
                $push: { chatRandom: updateDatabase[3]._id },
              }
            ),
          ]);

          const getPartner = await User.findOne({
            account: dataFindPartner.partner.account,
          })
            .select("role status name account sex createdAt following followers avatar partners messages avatarSVG")
            .populate({
              path: "avatarSVG",
              select: "-__v -user -_id",
            });
          socket.chatRandom.userStatus = "chatting";
          socket.chatRandom.partner = getPartner;
          socket.chatRandom.partnerIO = getPartner;
          socket.chatRandom.room = dataFindPartner.room;

          await Promise.all([
            User.findOneAndUpdate(
              {
                account: dataFindPartner.user.account,
              },
              {
                $inc: { partners: 1 },
              }
            ),
            User.findOneAndUpdate(
              {
                account: dataFindPartner.partner.account,
              },
              {
                $inc: { partners: 1 },
              }
            ),
          ]);

          //update user in room
          const getUsersWaitingData = getUsersWaitingRandom();
          _io.emit("update-users-waiting-room-random", getUsersWaitingData);
          // create and join room both 2 users:
          socket.join(dataFindPartner.room);
          //send auto request join room for partner
          _io.sockets.in(dataFindPartner.partner.account).emit("auto-join-room-for-partner-random", {
            partner: socket.chatRandom.user,
            room: socket.chatRandom.room,
          });
          //send info current user for partner
          _io.sockets
            .in(dataFindPartner.partner.account)
            .emit("find-partner-success-random", { partner: socket.chatRandom.user, message: dataFindPartner.message });
          //send info partner for current user
          _io.sockets.in(dataFindPartner.user.account).emit("find-partner-success-random", {
            partner: socket.chatRandom.partner,
            message: dataFindPartner.message,
          });
        }
      }
    });
    //AUTO JOIN ROOM FOR PARTNER
    socket.on("auto-join-room-for-partner-random", (data) => {
      if (data) {
        socket.chatRandom.userStatus = "chatting";
        socket.chatRandom.partner = data.partner;
        socket.chatRandom.partnerIO = data.partner;
        socket.chatRandom.room = data.room;
        socket.join(data.room);
      }
      console.log("ROOM AFTER FIND PARTNER SUCCESS", _io.sockets.adapter.rooms);
    });
    socket.on("update-users-chat-room-random", () => {
      const getUsersWaitingData = getUsersWaitingRandom();
      _io.emit("update-users-waiting-room-random", getUsersWaitingData);
    });
    //OUT WAITING ROOM
    socket.on("out-waiting-room-random", async (callback) => {
      await ChatRoomRandom.findOneAndUpdate(
        {
          account: socket.chatRandom.user._id,
        },
        {
          status: null,
        }
      );
      socket.chatRandom.userStatus = null;
      removeUserRandom(socket.chatRandom.user);
      socket.leave(socket.chatRandom.user.account);
      socket.chatRandom.user = null;
      socket.chatRandom.userIO = null;
      console.log("ROOM AFTER OUT WAITING ROOM:", _io.sockets.adapter.rooms);
      //update users in room
      const getUsersWaitingData = getUsersWaitingRandom();
      _io.emit("update-users-waiting-room-random", getUsersWaitingData);

      callback({
        status: "ok",
      });
    });
    //OUT WAITING ROOM
    socket.on("out-waiting-room-random-server", async () => {
      socket.chatRandom.userStatus = null;
      removeUserRandom(socket.chatRandom.user);
      socket.leave(socket.chatRandom.user.account);
      socket.chatRandom.user = null;
      socket.chatRandom.userIO = null;
      console.log("ROOM AFTER OUT WAITING ROOM:", _io.sockets.adapter.rooms);
      //update users in room
      const getUsersWaitingData = getUsersWaitingRandom();
      _io.emit("update-users-waiting-room-random", getUsersWaitingData);
    });

    //OUT CHATTING ROOM
    socket.on("out-chat-room-for-current-user", async (callback) => {
      try {
        await Promise.all([
          ChatRoomRandom.updateOne(
            {
              account: socket.chatRandom.user._id,
            },
            {
              room: null,
              partner: null,
              status: null,
            }
          ),
          ChatRoomRandom.updateOne(
            {
              account: socket.chatRandom.partner._id,
            },
            {
              room: null,
              partner: null,
              status: null,
            }
          ),
        ]);
        console.log("OUT", socket.chatRandom);
        _io.sockets
          .in(socket.chatRandom.partner.account)
          .emit("send-noti-partner-out-chat-room", "Đối phương đã rời khỏi phòng chat");

        //IF HAVE MANY BROWERS USING ACCOUNT USER
        _io.sockets
          .in(socket.chatRandom.user.account)
          .emit("send-noti-current-user-out-chat-room", "Đối phương đã rời khỏi phòng chat");
        //remove users from list users in room
        removeUserRandom(socket.chatRandom.user);
        socket.leave(socket.chatRandom.user.account);
        socket.leave(socket.chatRandom.room);
        socket.chatRandom.user = null;
        socket.chatRandom.userIO = null;
        socket.chatRandom.partner = null;
        socket.chatRandom.partnerIO = null;
        socket.chatRandom.userStatus = null;
        socket.chatRandom.room = null;
        console.log("ROOM AFTER PARTNER OUT CHAT ROOM:", _io.sockets.adapter.rooms);
        //update users in room
        const getUsersWaitingData = getUsersWaitingRandom();
        _io.emit("update-users-waiting-room-random", getUsersWaitingData);
        callback({
          status: "ok",
        });
      } catch (err) {
        callback({
          status: "err",
        });
      }
    });
    //OUT CHATTING ROOM FOR PARTNER
    socket.on("send-noti-partner-out-chat-room", async () => {
      removeUserRandom(socket.chatRandom.user);
      socket.leave(socket.chatRandom.user.account);
      socket.leave(socket.chatRandom.room);
      socket.chatRandom.user = null;
      socket.chatRandom.userIO = null;
      socket.chatRandom.partner = null;
      socket.chatRandom.partnerIO = null;
      socket.chatRandom.userStatus = null;
      socket.chatRandom.room = null;
      console.log("ROOM AFTER PARTNER PARTNER RECEIVE NOTI USER OUT CHATROOM:", _io.sockets.adapter.rooms);
      //update users in room
      const getUsersWaitingData = getUsersWaitingRandom();
      _io.emit("update-users-waiting-room-random", getUsersWaitingData);
    });
    //UPDATE STATUS FOR USER
    socket.on("update-status-user", ({ room, status }) => {
      _io.sockets.in(room).emit("update-status-user", status);
    });

    socket.on("send-noti-partner-disconnected", () => {
      removeUserRandom(socket.chatRandom.user);
      socket.leave(socket.chatRandom.user.account);
      socket.leave(socket.chatRandom.room);
      socket.chatRandom.user = null;
      socket.chatRandom.userIO = null;
      socket.chatRandom.partner = null;
      socket.chatRandom.partnerIO = null;
      socket.chatRandom.userStatus = null;
      socket.chatRandom.room = null;
      console.log("ROOM AFTER PARTNER PARTNER RECEIVE NOTI USER OUT CHATROOM:", _io.sockets.adapter.rooms);
    });

    socket.on("send-chat-content", async (message, callback) => {
      try {
        const newMessage = {
          from: socket.chatRandom.user,
          to: socket.chatRandom.partner,
          msg: message,
          account: socket.chatRandom.user.account,
          name: socket.chatRandom.user.name,
          message: message,
          sex: socket.chatRandom.user.sex,
        };
        const createMessage = await MessageRoomRandom.create({
          from: socket.chatRandom.user._id,
          to: socket.chatRandom.partner._id,
          room: socket.chatRandom.room,
          msg: message,
        });
        await Promise.all([
          User.findOneAndUpdate(
            {
              account: socket.chatRandom.user.account,
            },
            {
              $inc: { messages: 1 },
            }
          ),
        ]);
        const sendMessage = {
          ...newMessage,
          _id: createMessage._id,
          createdAt: createMessage.createdAt,
          updatedAt: createMessage.updatedAt,
        };

        const currentRoom = socket.chatRandom.room;
        _io.sockets.to(currentRoom).emit("receive-chat-content", sendMessage);
        //send sound notify
        _io.sockets.in(socket.chatRandom.partner.account).emit("receive-chat-sound");
        callback({
          status: "ok",
        });
      } catch (err) {
        callback({
          status: "err",
        });
      }
    });
    socket.on("chat-typing", (data) => {
      if (data === true) {
        const mes = { status: true, message: "Đối phương đang nhập ..." };
        socket.to(socket.chatRandom.room).emit("chat-typing", mes);
      } else {
        const mes = { status: false, message: "Đối phương đã huỷ nhập" };
        socket.to(socket.chatRandom.room).emit("chat-typing", mes);
      }
    });
    socket.on("banned-account", ({ account, status }) => {
      console.log("send room banned account");
      _io.to(`${account}-room`).emit("banned-account", status);
    });

    //// Post Comment
    socket.on("join-room-post-comment", (data) => {
      socket.join(`post_comment_${data}`);
      console.log("ROOM:", _io.sockets.adapter.rooms);
    });
    socket.on("leave-room-post-comment", (data) => {
      socket.leave(`post_comment_${data}`);
      console.log("ROOM:", _io.sockets.adapter.rooms);
    });
    socket.on("join-post-room", (data) => {
      socket.join(`post_${data._id}`);
      console.log("ROOM:", _io.sockets.adapter.rooms);
    });
    socket.on("typing-post-comment", ({ room, value }) => {
      socket.to(room).emit("typing-post-comment", value);
    });
    socket.on("create-post-comment", async (data, callback) => {
      try {
        console.log(data.room);
        const getPostComment = await PostComment.find({
          _id: data.commentId,
        });
        _io.to(data.room).emit("create-new-post-comment", getPostComment);
        callback({
          status: "ok",
        });
      } catch (err) {
        callback({
          status: "err",
        });
      }
    });
    socket.on("delete-post-rep-comment", async (data, callback) => {
      console.log(data);
      console.log("ROOM:", _io.sockets.adapter.rooms);
      _io.to(data.room).emit("delete-post-rep-comment", data);
      callback({
        status: "ok",
      });
    });
    socket.on("update-post-comments", (data) => {
      _io.to(data.room).emit("update-post-comments", data.item);
    });
    socket.on("update-edit-post-comment", (data, callback) => {
      _io.to(data.room).emit("update-edit-post-comment", data);
      callback({
        status: "ok",
      });
    });
    socket.on("join-room-update-public-post", () => {
      socket.join("update-public-post");
      console.log("ROOM:", _io.sockets.adapter.rooms);
    });

    socket.on("update-likes-post", (data) => {
      console.log(data);
      _io.to(`post_${data.postID}`).emit("update-likes-post", data);
      _io.to(`update-public-post`).emit("update-public-post", data);
    });

    socket.on("create-new-post-rep-comment", async (data, callback) => {
      try {
        console.log(data);
        const getPostComment = await PostComment.findOne({
          _id: data.parentComment,
        });

        _io.to(data.room).emit("create-new-post-rep-comment", getPostComment);
        callback({
          status: "ok",
        });
      } catch (err) {
        callback({
          status: "err",
        });
      }
    });
    socket.on("update-notify-number", async (data, callback) => {
      try {
        console.log(data);
        const getPostComment = await Notify.updateMany(
          {
            user_receive: data,
            read: false,
          },
          { read: true }
        );

        socket.emit("update-notify-number", { data: "hey there!" });
        callback({
          status: "ok",
        });
      } catch (err) {
        callback({
          status: "err",
        });
      }
    });
    socket.on("join-room-notify", (data) => {
      socket.join(`${data}_notify`);
      console.log("ROOM:", _io.sockets.adapter.rooms);
    });
    socket.on("inc-notify-number", (data) => {
      console.log(data);
      _io.to(`${data.account}_notify`).emit("inc-notify-number", data.number);
    });
    socket.on("join-user-online", (data) => {
      const checkUsersOnline = _usersOnline.filter((item) => item.account === data.account);
      console.log("check user", checkUsersOnline);
      if (checkUsersOnline.length === 0) {
        _usersOnline.push({
          _id: data._id,
          account: data.account,
        });
        console.log("LIST USERS ONLINE", _usersOnline);
        _io.sockets.emit("users-online", _usersOnline);
      }
    });

    //SOCKET DISCONNECTING
    socket.on("disconnecting", async () => {
      //update users online
      if (socket.userIO) {
        const getIndexListUsersOnline = () => {
          let index = -1;
          _usersOnline.forEach((item, i) => {
            if (item.account === socket.userIO.account) {
              index = i;
              return index;
            }
          });
          return index;
        };
        const indexUsersOnline = getIndexListUsersOnline();
        if (indexUsersOnline != -1) {
          _usersOnline.splice(indexUsersOnline, 1);
          _io.sockets.emit("users-online", _usersOnline);
        }
      }
      //close window when in waiting room
      if (socket.chatRandom && !socket.chatRandom.room) {
        if (socket.chatRandom.user && socket.chatRandom.userStatus === "waiting") {
          await ChatRoomRandom.findOneAndUpdate(
            {
              account: socket.chatRandom.user._id,
            },
            {
              status: null,
            }
          );
          removeUserRandom(socket.chatRandom.user);
          socket.chatRandom.user = null;
          socket.chatRandom.userIO = null;
          socket.chatRandom.userStatus = null;
        }
      } else if (socket.chatRandom && socket.chatRandom.room) {
        //close window when chatting
        if (socket.chatRandom.user && socket.chatRandom.partner && socket.chatRandom.userStatus === "chatting") {
          await Promise.all([
            ChatRoomRandom.updateOne(
              {
                account: socket.chatRandom.user._id,
              },
              {
                status: null,
                partner: null,
                room: null,
              }
            ),
            ChatRoomRandom.updateOne(
              {
                account: socket.chatRandom.partner._id,
              },
              {
                status: null,
                partner: null,
                room: null,
              }
            ),
          ]);
          _io.sockets
            .in(socket.chatRandom.partner.account)
            .emit("send-noti-partner-disconnected", "Đối phương đã rời khỏi ứng dụng!!");
          removeUserRandom(socket.chatRandom.user);
          socket.chatRandom.user = null;
          socket.chatRandom.userIO = null;
          socket.chatRandom.partner = null;
          socket.chatRandom.partnerIO = null;
          socket.chatRandom.userStatus = null;
          socket.chatRandom.room = null;

          console.log("ROOM AFTER USER DISCONNECTING:", _io.sockets.adapter.rooms);
        }
      }
    });
    socket.on("disconnect", () => {
      console.log(`User disconnect id is ${socket.id}`);
    });
  }
}
module.exports = new SocketServices();
