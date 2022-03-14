const express = require("express");
const dotenv = require("dotenv");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
dotenv.config({ path: "./config.env" });
const app = express();
const http = require("http");
const AppError = require("./utils/app_error");
const errorController = require("./controllers/error_controller");
const server = http.createServer(app);
const cors = require("cors");
//MIDDLEWARE
app.use(cors());
app.options("*", cors());
//security http
app.use(helmet());

//development logging
// if (process.env.NODE_ENV === "development") {
//   app.use(morgan("dev"));
// }

//limit request
const limiter = rateLimit({
  max: 100,
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
// app.use("/api/v1/search", searchRouters);
// app.use("/api/v1/musics", musicRouters);
// app.use("/api/v1/users", userRouters);
// app.use("/api/v1/artists", artistRouters);
// app.use("/api/v1/genres", genreRouters);
// app.use("/api/v1/hearts", heartRouters);
// app.use("/api/v1/playlists", playlistRouters);
app.all("*", (req, res, next) => {
  next(new AppError(`No found ${req.originalUrl}`, 404));
});

app.use(errorController);
module.exports = app;
