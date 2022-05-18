const express = require("express");
const dotenv = require("dotenv");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
dotenv.config({ path: "./config.env" });
const app = express();
const AppError = require("./utils/app_error");
const errorController = require("./controllers/error_controller");
const userRouters = require("./routers/user_routers");
const postRouters = require("./routers/post_routers");
const heartRouters = require("./routers/heart_routers");

const systemRouters = require("./routers/system_routers");
const cors = require("cors");
//MIDDLEWARE
app.use(cors());
app.options(process.env.CLIENT_SOCKET, cors());
//security http
app.use(helmet());

//limit request
const limiter = rateLimit({
  max: 1000,
  window: 60 * 60 * 1000,
  message: "Too many requests from this ip, please try again 1 hour later",
});
app.use("/api", limiter);

///// body parser in , reading data from body
app.use(express.json());

//against NoSQL Injection
app.use(mongoSanitize());

//against XSS (HTML, JS)
app.use(xss());

//serving static file
app.use(express.static(`${__dirname}/public`));

//test middleware
app.use((req, res, next) => {
  req.timeNow = new Date().toISOString();
  next();
});

//routers
app.get("/", (req, res) => {
  res.status(200).send("404 Not Found");
});
app.use("/api/v1/users", userRouters);
app.use("/api/v1/posts", postRouters);
app.use("/api/v1/hearts", heartRouters);
app.use("/api/v1/systems", systemRouters);

app.all("*", (req, res, next) => {
  next(new AppError(`No found ${req.originalUrl}`, 404));
});

app.use(errorController);
module.exports = app;
