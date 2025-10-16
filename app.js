var express = require("express");
var path = require("path");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var session = require("express-session");
var http = require("http");
var request = require("request");

var routes = require("./routes/index");
var users = require("./routes/users");
var upload = require("./routes/upload");
var admin = require("./routes/admin");
var api = require("./routes/api");
var docs = require("./routes/docs");
var shop = require("./routes/shop");
var washing = require("./routes/washing");
var buyer = require("./routes/buyer");
var movie = require("./routes/movie");

var app = express();

var mysql = require("mysql");
var pool = mysql.createPool({
  connectionLimit: 20,
  acquireTimeout: 5000,
  host: "localhost",
  user: "yellowbox",
  database: "yellowbox",
  password: "dpfshdnqkrtm",
  multipleStatements: true,
});

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.engine("html", require("ejs").renderFile);

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  session({
    secret: "keyboard cat",
    cookie: { maxAge: 60000 },
    resave: true,
    saveUninitialized: true,
  })
);

app.use(
  require("express-markdown")({
    directory: __dirname + "/public",
    view: "foo",
    variable: "bar",
  })
);

app.use(express.static(path.join(__dirname, "public")));

app.use(function (req, res, next) {
  var appleboxHost = req.headers["applebox-host"];

  if (appleboxHost) {
    var headers = req.headers;
    headers["host"] = appleboxHost;
    var st = appleboxHost.indexOf("-");
    var ed = appleboxHost.indexOf(".");
    yid = appleboxHost.substring(st + 1, ed);
    pool.getConnection(function (err, connection) {
      if (err) {
        res.status(500).json({ type: "error", message: err, code: 500 });
      } else {
        var query = connection.query(
          "SELECT ip FROM applebox WHERE yid = ?",
          [yid],
          function (err, results) {
            if (err) {
              res.status(500).json({ type: "error", message: err, code: 500 });
            } else {
              connection.release();
              if (results.length == 0) {
                res
                  .status(404)
                  .json({ type: "error", message: err, code: 404 });
              } else {
                toIp = results[0].ip;
                const x = request({
                  uri: "http://" + toIp + req.url,
                  headers: { Authorization: req.headers["authorization"] },
                  method: req.method,
                  json: req.body,
                  timeout: 5000,
                  followRedirect: true,
                  maxRedirects: 2,
                }).on("error", function (err) {
                  console.error(err);
                  res.status(520).json({ error: "not connected" });
                });
                x.pipe(res);
              }
            }
          }
        );
      }
    });
  } else {
    if (
      req.url == "/v1/Locker/open_to_save" ||
      req.url == "/v1/Locker/close_to_save" ||
      req.url == "/v1/Locker/open_to_take" ||
      req.url == "/v1/Locker/close_to_take"
    ) {
      var url = req.url.replace("Locker", "Server");
      request({
        uri: "http://server.apple-box.kr" + url,
        headers: { Authorization: req.headers["authorization"] },
        method: req.method,
        json: req.body,
        timeout: 20000,
        followRedirect: true,
        maxRedirects: 2,
      });
    }
    next();
  }
});

var expressWinston = require("express-winston");
var winston = require("winston");
require("winston-daily-rotate-file");
var transport = new winston.transports.DailyRotateFile({
  json: true,
  filename: "./logs/log",
  datePattern: "yyyy-MM-dd.",
  prepend: true,
  level: "warn",
});
expressWinston.requestWhitelist.push("body");
app.use(
  expressWinston.logger({
    transports: [
      new winston.transports.Console({
        json: true,
        colorize: true,
        level: "error",
      }),
      transport,
    ],
    statusLevels: false,
    level: function (req, res) {
      var level = "";
      if (res.statusCode >= 100) {
        level = "info";
      }
      if (res.statusCode >= 400) {
        level = "warn";
      }
      if (res.statusCode >= 500) {
        level = "error";
      }
      if (res.statusCode == 401 || res.statusCode == 403) {
        level = "critical";
      }
      if (
        req.path === "/v1/Locker/open_to_save" ||
        req.path === "/v1/Locker/close_to_save" ||
        req.path === "/v1/Locker/close_to_take" ||
        req.path === "/v1/Locker/open_to_take"
      ) {
        level = "warn";
      }
      return level;
    },
  })
);

app.use(require("express-domain-middleware"));

app.use("/", routes);
app.use("/users", users);
app.use("/admin", admin);
app.use("/upload", upload);
app.use("/v1", api);
app.use("/docs", docs);
app.use("/shop", shop);
app.use("/washing", washing);
app.use("/buyer", buyer);
app.use("/movie", movie);

app.use(function errorHandler(err, req, res, next) {
  res.status(500).json({ type: "error", message: err.message, code: 500 });
});

module.exports = app;
