const mongoose = require("mongoose");
const dotenv = require("dotenv");

const User = require("./models/User");

const SocketServices = require("./services/chat.service");
const http = require("http");
const jwt = require("jsonwebtoken");

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
//GLOBAL VARIABLES
global._io = io;
global._usersOnline = [];
global._io.use(async (socket, next) => {
  const authToken = socket.handshake.auth.token;
  let token;
  try {
    if (authToken && authToken.startsWith("Bearer")) {
      token = authToken.split(" ")[1];
      if (!token) {
        throw new Error("Login to continute");
      }
      const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const user = await User.findOne({ _id: decode.id })
        .select("role status name account sex createdAt following followers avatar partners messages avatarSVG")
        .populate({
          path: "avatarSVG",
          select: "-__v -user -_id",
        });
      socket.userIO = user;
      const checkUsersOnline = global._usersOnline.filter((item) => item.account === user.account);
      console.log("check user", checkUsersOnline);
      if (checkUsersOnline.length === 0) {
        global._usersOnline.push({
          _id: user._id,
          account: user.account,
        });
      }
      console.log("LIST USERS ONLINE", global._usersOnline);
      socket.emit("users-online", global._usersOnline);
      global._io.sockets.emit("users-online", global._usersOnline);
      next();
    } else {
      throw new Error("Login to continute");
    }
  } catch (err) {
    if (err.message) {
      return next(new Error(err.message));
    }
  }
});
global._io.on("connection", SocketServices.connection);

server.listen(port, () => {
  console.log("Server đang chay tren cong", port);
});
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log("Error: ", err);
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
