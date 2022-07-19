const ChatRoom = require("../models/ChatRoom");
const Message = require("../models/Message");
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
        const userJoinRooms = joinListUsersRandom(updateUser);
        console.log(userJoinRooms);
        if (userJoinRooms) {
          socket.userStatus = "waiting";
          socket.chatAPPUser = userJoinRooms;
          socket.join(user.account);
          await ChatRoom.create({
            account: socket.chatAPPUser.account,
            status: "waiting",
          });
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
      const currentUser = socket.userIO;
      const dataFindPartner = findPartnerRandom(currentUser);
      //send message find partner for current user
      _io.sockets.in(currentUser.account).emit("find-partner-random", dataFindPartner);
      //find partner success
      if (dataFindPartner.status === "success") {
        socket.userStatus = "chatting";
        socket.chatAPPUserPartner = dataFindPartner.partner;
        socket.partnerIO = dataFindPartner.partner;
        const roomGeneral = `${socket.chatAPPUser.account}-${process.env.GENERAL_KEY_CHAT}-${dataFindPartner.partner.account}`;
        //Convert status from waiting to chatting
        await Promise.all([
          ChatRoom.findOneAndUpdate(
            {
              account: socket.chatAPPUser.account,
            },
            {
              status: "chatting",
              partner: socket.chatAPPUserPartner.account,
              room: roomGeneral,
            }
          ),
          ChatRoom.findOneAndUpdate(
            {
              account: socket.chatAPPUserPartner.account,
            },
            {
              status: "chatting",
              partner: socket.chatAPPUser.account,
              room: roomGeneral,
            }
          ),
          User.findOneAndUpdate(
            {
              account: socket.chatAPPUser.account,
            },
            {
              $inc: { partners: 1 },
            }
          ),
          User.findOneAndUpdate(
            {
              account: socket.chatAPPUserPartner.account,
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
        socket.join(roomGeneral);
        socket.roomRandom = roomGeneral;
        //send auto request join room for partner
        _io.sockets
          .in(socket.chatAPPUserPartner.account)
          .emit("auto-join-room-for-partner-random", { partner: dataFindPartner.user });
        //send info current user for partner
        _io.sockets
          .in(socket.chatAPPUserPartner.account)
          .emit("find-partner-success-random", { partner: dataFindPartner.user, message: dataFindPartner.message });
        //send info partner for current user
        _io.sockets
          .in(socket.chatAPPUser.account)
          .emit("find-partner-success-random", { partner: dataFindPartner.partner, message: dataFindPartner.message });
      }
    });
    //AUTO JOIN ROOM FOR PARTNER
    socket.on("auto-join-room-for-partner-random", (partner) => {
      const roomGeneral = `${partner.account}-${process.env.GENERAL_KEY_CHAT}-${socket.chatAPPUser.account}`;
      socket.join(roomGeneral);
      socket.userStatus = "chatting";
      socket.chatAPPUserPartner = partner;

      socket.roomRandom = roomGeneral;
      console.log("ROOM AFTER FIND PARTNER SUCCESS", _io.sockets.adapter.rooms);
    });

    //OUT WAITING ROOM
    socket.on("out-waiting-room-random", async (callback) => {
      await ChatRoom.deleteOne({
        account: socket.chatAPPUser.account,
        status: "waiting",
      });
      socket.userStatus = null;
      removeUserRandom(socket.chatAPPUser);
      socket.leave(socket.chatAPPUser.account);
      socket.chatAPPUser = null;
      console.log("ROOM AFTER OUT WAITING ROOM:", _io.sockets.adapter.rooms);
      //update users in room
      const getUsersWaitingData = getUsersWaitingRandom();
      _io.emit("update-users-waiting-room-random", getUsersWaitingData);

      callback({
        status: "ok",
      });
    });
    //RESTORE SUCCESS
    socket.on("success-restore-for-partner", async ({ partner, roomGeneral }, callback) => {
      try {
        const user = socket.userIO;
        const userJoinRooms = joinListUsersRandom(user);
        if (userJoinRooms) {
          socket.userStatus = "chatting";
          socket.chatAPPUser = userJoinRooms;
          socket.chatAPPUserPartner = partner;
          socket.join(user.account);
          socket.roomRandom = roomGeneral;
          joinListUsersChatting(socket.chatAPPUser);
        }
        console.log("ROOM AFTER RESTORE SUCCESS:", _io.sockets.adapter.rooms);
        callback({
          status: "ok",
        });
      } catch (err) {
        callback({
          status: "err",
        });
      }
    });

    //RESTORE DATA CHAT ROOM FOR USER RE-CONNECT
    socket.on(
      "restore-data-chat-room-for-user-reconnect",
      async ({ user: userReq, partner, room: roomGeneral }, callback) => {
        try {
          const user = socket.userIO;
          const userJoinRooms = joinListUsersRandom(user);
          if (userJoinRooms) {
            socket.chatAPPUser = userJoinRooms;
            socket.join(user.account);
            socket.userStatus = "waiting";
            socket.roomRandom = roomGeneral;

            const checkPartnerIsWaiting = await ChatRoom.findOne({
              account: partner,
              partner: socket.chatAPPUser.account,
              status: "partner-disconnected",
            });
            if (checkPartnerIsWaiting) {
              const getMessages = await Message.find({
                room: roomGeneral,
              })
                .populate({
                  path: "from",
                  select: "-__v",
                })
                .populate({
                  path: "to",
                  select: "-__v",
                });
              const getPartner = await User.findOne({
                account: partner,
              })
                .select("role status name account sex createdAt following followers avatar partners messages avatarSVG")
                .populate({
                  path: "avatarSVG",
                  select: "-__v -user -_id",
                });
              socket.chatAPPUserPartner = getPartner;
              socket.roomRandom = roomGeneral;
              socket.join(roomGeneral);
              socket.userStatus = "chatting";
              joinListUsersChatting(socket.chatAPPUser);
              _io.sockets
                .in(socket.chatAPPUser.account)
                .emit("success-restore", { msg: "Khôi phục thành công", partner: getPartner });
              _io.sockets.in(socket.chatAPPUser.account).emit("success-restore-message", getMessages);
              await Promise.all([
                ChatRoom.findOneAndUpdate(
                  {
                    account: socket.chatAPPUser.account,
                    room: roomGeneral,
                  },
                  {
                    status: "chatting",
                  }
                ),
                ChatRoom.findOneAndUpdate(
                  {
                    account: socket.chatAPPUserPartner.account,
                    room: roomGeneral,
                  },
                  {
                    status: "chatting",
                  }
                ),
              ]);
              _io.sockets.in(socket.chatAPPUserPartner.account).emit("success-restore-for-partner", {
                msg: "Đối phương đã kết nối lại thành công",
                partner: socket.chatAPPUser,
                roomGeneral,
              });
            } else {
              console.log("THẰNG PARTNER NÓ OUT CMNR");
              _io.sockets.in(socket.chatAPPUser.account).emit("reject-restore", "THẰNG PARTNER NÓ OUT CMNR");
              await Promise.all([
                ChatRoom.findOneAndDelete({
                  account: socket.chatAPPUser.account,
                  partner: partner,
                }),
                Message.deleteMany({
                  room: roomGeneral,
                }),
              ]);
              removeUserRandom(socket.chatAPPUser);
              socket.leave(socket.chatAPPUser.account);
              socket.leave(socket.roomRandom);
              socket.chatAPPUser = null;
              socket.chatAPPUserPartner = null;
              socket.roomRandom = null;
              socket.userStatus = null;
            }

            console.log("ROOM AFTER RESTORE DATA:", _io.sockets.adapter.rooms);
          }
          callback({
            status: "ok",
          });
        } catch (err) {
          callback({
            status: "err",
          });
        }
      }
    );
    //RESTORE DATA CHAT ROOM FOR USER CHATTING
    socket.on(
      "restore-data-chat-room-for-user-chatting",
      async ({ user: userReq, partner, room: roomGeneral }, callback) => {
        try {
          const user = socket.userIO;
          //JOIN LIST WAITTING USERS
          const userJoinRooms = joinListUsersRandom(user);

          socket.chatAPPUser = user;
          socket.join(user.account);
          socket.userStatus = "waiting";
          socket.roomRandom = roomGeneral;
          const checkPartnerIsWaiting = await ChatRoom.findOne({
            account: partner,
            partner: socket.chatAPPUser.account,
            status: "chatting",
          });
          console.log("RESULT FIND", partner, socket.chatAPPUser.account, checkPartnerIsWaiting);
          if (checkPartnerIsWaiting) {
            const getMessages = await Message.find({
              room: roomGeneral,
            })
              .populate({
                path: "from",
                select: "-__v",
              })
              .populate({
                path: "to",
                select: "-__v",
              });
            console.log("messages", getMessages);
            const getPartner = await User.findOne({
              account: partner,
            })
              .select("role status name account sex createdAt following followers avatar partners messages avatarSVG")
              .populate({
                path: "avatarSVG",
                select: "-__v -user -_id",
              });
            socket.chatAPPUserPartner = getPartner;
            socket.join(roomGeneral);
            socket.userStatus = "chatting";
            joinListUsersChatting(socket.chatAPPUser);
            _io.sockets
              .in(socket.chatAPPUser.account)
              .emit("success-restore", { msg: "Khôi phục thành công", partner: getPartner });
            _io.sockets.in(socket.chatAPPUser.account).emit("success-restore-message", getMessages);

            _io.sockets.in(socket.chatAPPUserPartner.account).emit("success-restore-for-partner", {
              msg: "Đối phương đã kết nối lại thành công",
              partner: socket.chatAPPUser,
              roomGeneral,
            });
          } else {
            console.log("THẰNG PARTNER NÓ OUT CMNR");
            _io.sockets.in(socket.chatAPPUser.account).emit("reject-restore", "THẰNG PARTNER NÓ OUT CMNR");
            await Promise.all([
              ChatRoom.findOneAndDelete({
                account: socket.chatAPPUser.account,
                partner: partner,
              }),
              Message.deleteMany({
                room: roomGeneral,
              }),
            ]);
            removeUserRandom(socket.chatAPPUser);
            socket.leave(socket.chatAPPUser.account);
            socket.leave(socket.roomRandom);
            socket.chatAPPUser = null;
            socket.chatAPPUserPartner = null;
            socket.roomRandom = null;
            socket.userStatus = null;
          }

          console.log("ROOM AFTER RESTORE DATA:", _io.sockets.adapter.rooms);
          callback({
            status: "ok",
          });
        } catch (err) {
          callback({
            status: "err",
          });
        }
      }
    );

    //OUT CHATTING ROOM
    socket.on("out-chat-room-for-current-user", async (callback) => {
      try {
        await Promise.all([
          ChatRoom.findOneAndDelete({
            account: socket.chatAPPUser.account,
            partner: socket.chatAPPUserPartner.account,
          }),
          ChatRoom.findOneAndUpdate(
            {
              account: socket.chatAPPUserPartner.account,
              partner: socket.chatAPPUser.account,
            },
            {
              status: "partner-outed-chat",
            }
          ),
        ]);

        _io.sockets
          .in(socket.chatAPPUserPartner.account)
          .emit("send-noti-partner-out-chat-room", "Đối phương đã rời khỏi phòng chat");

        //IF HAVE MANY BROWERS USING ACCOUNT USER
        _io.sockets
          .in(socket.chatAPPUser.account)
          .emit("send-noti-current-user-out-chat-room", "Đối phương đã rời khỏi phòng chat");
        //remove users from list users in room
        removeUserRandom(socket.chatAPPUser);
        socket.leave(socket.chatAPPUser.account);
        socket.leave(socket.roomRandom);
        socket.chatAPPUser = null;
        socket.userStatus = null;
        socket.chatAPPUserPartner = null;
        socket.roomRandom = null;
        console.log("ROOM AFTER PARTNER OUT CHAT ROOM:", _io.sockets.adapter.rooms);
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
      // await ChatRoom.findOneAndDelete({
      //   account: socket.chatAPPUser.account,
      //   partner: socket.chatAPPUserPartner.account,
      // });
      //remove users from list users in room
      socket.userStatus = "partner-outed-chat";
      console.log("ROOM AFTER PARTNER PARTNER RECEIVE NOTI USER OUT CHATROOM:", _io.sockets.adapter.rooms);
    });
    //UPDATE STATUS FOR USER
    socket.on("update-status-user", ({ room, status }) => {
      console.log("ROOM:", _io.sockets.adapter.rooms);

      console.log(room);
      _io.sockets.in(room).emit("update-status-user", status);
    });
    //AGREE OUT CHATTING ROOM
    socket.on("agree-out-chat-room-for-current-user", async (callback) => {
      try {
        await Promise.all([
          ChatRoom.findOneAndDelete({
            account: socket.chatAPPUser.account,
            partner: socket.chatAPPUserPartner.account,
          }),
          Message.deleteMany({
            room: socket.roomRandom,
          }),
        ]);
        //remove users from list users in room
        removeUserRandom(socket.chatAPPUser);
        socket.leave(socket.chatAPPUser.account);
        socket.leave(socket.roomRandom);
        socket.chatAPPUser = null;
        socket.chatAPPUserPartner = null;
        socket.roomRandom = null;
        socket.userStatus = null;
        console.log("ROOM AFTER PARTNER AGREE OUT CHAT ROOM:", _io.sockets.adapter.rooms);
        callback({
          status: "ok",
        });
      } catch (err) {
        callback({
          status: "err",
        });
      }
    });
    //AGREE OUT CHATTING ROOM DON'T WAIT PARTNER
    socket.on("agree-out-chat-room-dont-wait-partner", async (callback) => {
      try {
        await Promise.all([
          ChatRoom.findOneAndDelete({
            account: socket.chatAPPUser.account,
            partner: socket.chatAPPUserPartner.account,
          }),
        ]);
        //remove users from list users in room
        removeUserRandom(socket.chatAPPUser);
        socket.leave(socket.chatAPPUser.account);
        socket.leave(socket.roomRandom);
        socket.chatAPPUser = null;
        socket.chatAPPUserPartner = null;
        socket.roomRandom = null;
        socket.userStatus = null;
        console.log("ROOM AFTER PARTNER AGREE OUT CHAT ROOM DONT WAIT PARTNER:", _io.sockets.adapter.rooms);
        callback({
          status: "ok",
        });
      } catch (err) {
        callback({
          status: "err",
        });
      }
    });
    socket.on("delete-unmounted-chat", async (callback) => {
      try {
        console.log(socket.userStatus);
        if (
          socket.userStatus === "partner-outed-chat" &&
          socket.chatAPPUser &&
          socket.roomRandom &&
          socket.chatAPPUserPartner
        ) {
          await Promise.all([
            ChatRoom.findOneAndDelete({
              account: socket.chatAPPUser.account,
              status: "partner-outed-chat",
            }),
            Message.deleteMany({
              room: socket.roomRandom,
            }),
          ]);
          removeUserRandom(socket.chatAPPUser);
          socket.leave(socket.chatAPPUser.account);
          socket.leave(socket.roomRandom);
          socket.chatAPPUser = null;
          socket.chatAPPUserPartner = null;
          socket.roomRandom = null;
          socket.userStatus = null;
          console.log("DISCONNECTING STATUS: PARTNER-OUT-CHAT HIHI", _io.sockets.adapter.rooms);
        } else if (socket.userStatus === "waiting" && socket.chatAPPUser) {
          await ChatRoom.findOneAndDelete({
            account: socket.chatAPPUser.account,
            status: "waiting",
          });
          removeUserRandom(socket.chatAPPUser);
          socket.leave(socket.chatAPPUser.account);
          socket.chatAPPUser = null;
          socket.userStatus = null;
          console.log("ROOM AFTER USER DISCONNECTING:", _io.sockets.adapter.rooms);
        } else if (
          socket.userStatus === "partner-disconnected" &&
          socket.chatAPPUser &&
          socket.roomRandom &&
          socket.chatAPPUserPartner
        ) {
          await Promise.all([
            ChatRoom.deleteMany({
              room: socket.roomRandom,
            }),
            Message.deleteMany({
              room: socket.roomRandom,
            }),
          ]);
          removeUserRandom(socket.chatAPPUser);
          socket.leave(socket.chatAPPUser.account);
          socket.chatAPPUser = null;
          socket.chatAPPUserPartner = null;
          socket.roomRandom = null;
          socket.leave(socket.roomRandom);
          socket.userStatus = null;
          console.log("DISCONNECTING STATUS: PARTNER-DISCONNECTED", _io.sockets.adapter.rooms);
        }
        callback({
          status: "ok",
        });
      } catch (err) {
        callback({
          status: "error",
        });
      }
    });
    //AGREE OUT CHATTING ROOM DON'T WAIT PARTNER
    socket.on("send-noti-partner-disconnected", () => {
      socket.userStatus = "partner-disconnected";
    });

    socket.on("send-chat-content", async (message, callback) => {
      try {
        const newMessage = {
          from: socket.chatAPPUser,
          to: socket.chatAPPUserPartner,
          msg: message,
          account: socket.chatAPPUser.account,
          name: socket.chatAPPUser.name,
          message: message,
          sex: socket.chatAPPUser.sex,
        };

        const roomGeneral1 = `${socket.chatAPPUser.account}-${process.env.GENERAL_KEY_CHAT}-${socket.chatAPPUserPartner.account}`;
        const roomGeneral2 = `${socket.chatAPPUserPartner.account}-${process.env.GENERAL_KEY_CHAT}-${socket.chatAPPUser.account}`;

        const createMessage = await Message.create({
          from: socket.chatAPPUser._id,
          to: socket.chatAPPUserPartner._id,
          // room: _io.sockets.adapter.rooms.get(roomGeneral1) ? roomGeneral1 : roomGeneral2,
          room: socket.roomRandom,
          msg: message,
        });
        await Promise.all([
          User.findOneAndUpdate(
            {
              account: socket.chatAPPUser.account,
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

        const currentRoom = socket.roomRandom || socket.roomRandomVip;
        _io.sockets.to(currentRoom).emit("receive-chat-content", sendMessage);
        //send sound notify
        _io.sockets.in(socket.chatAPPUserPartner.account).emit("receive-chat-sound");
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
        console.log("getIndexListUsers", indexUsersOnline);
        if (indexUsersOnline != -1) {
          _usersOnline.splice(indexUsersOnline, 1);
          console.log("USERS ONLINE", _usersOnline);

          _io.sockets.emit("users-online", _usersOnline);
        }
      }
      if (!socket.roomRandom) {
        if (socket.chatAPPUser && socket.userStatus === "waiting") {
          await ChatRoom.findOneAndDelete({
            account: socket.chatAPPUser.account,
            status: "waiting",
          });
          removeUserRandom(socket.chatAPPUser);
          socket.leave(socket.chatAPPUser.account);
          socket.chatAPPUser = null;
          console.log("ROOM AFTER USER DISCONNECTING:", _io.sockets.adapter.rooms);
        }
      } else {
        if (socket.userStatus === "partner-outed-chat") {
          await Promise.all([
            ChatRoom.findOneAndDelete({
              account: socket.chatAPPUser.account,
              status: "partner-outed-chat",
            }),
            Message.deleteMany({
              room: socket.roomRandom,
            }),
          ]);
          removeUserRandom(socket.chatAPPUser);
          socket.leave(socket.chatAPPUser.account);
          socket.chatAPPUser = null;
          socket.chatAPPUserPartner = null;
          socket.roomRandom = null;
          socket.leave(socket.roomRandom);
          console.log("DISCONNECTING STATUS: PARTNER-OUT-CHAT", _io.sockets.adapter.rooms);
        } else if (socket.userStatus === "partner-disconnected") {
          await Promise.all([
            ChatRoom.deleteMany({
              room: socket.roomRandom,
            }),
            Message.deleteMany({
              room: socket.roomRandom,
            }),
          ]);
          removeUserRandom(socket.chatAPPUser);
          socket.leave(socket.chatAPPUser.account);
          socket.chatAPPUser = null;
          socket.chatAPPUserPartner = null;
          socket.roomRandom = null;
          socket.leave(socket.roomRandom);
          socket.userStatus = null;
          console.log("DISCONNECTING STATUS: PARTNER-DISCONNECTED", _io.sockets.adapter.rooms);
        } else if (socket.chatAPPUser && socket.chatAPPUserPartner && socket.userStatus === "chatting") {
          await Promise.all([
            ChatRoom.findOneAndUpdate(
              {
                account: socket.chatAPPUser.account,
                partner: socket.chatAPPUserPartner.account,
                status: "chatting",
              },
              {
                status: "disconnected",
              }
            ),
            ChatRoom.findOneAndUpdate(
              {
                account: socket.chatAPPUserPartner.account,
                partner: socket.chatAPPUser.account,
                status: "chatting",
              },
              {
                status: "partner-disconnected",
              }
            ),
          ]);
          _io.sockets
            .in(socket.chatAPPUserPartner.account)
            .emit("send-noti-partner-disconnected", "Đối phương đã rời khỏi ứng dụng!!");
          removeUserRandom(socket.chatAPPUser);
          socket.leave(socket.chatAPPUser.account);
          socket.chatAPPUser = null;
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
