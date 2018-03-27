const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const exphbs = require("express-handlebars");
const session = require('express-session');
const cookieParser = require('cookie-parser');

require('dotenv').load();

var hbs = exphbs.create({
    extname: ".hbs",
    helpers: {
        raw: function (a) { return a; },
    }
});

app.engine(".hbs", hbs.engine);

app.set("view engine", ".hbs");
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(function(req, res, next) {
    res.setHeader("Content-Security-Policy", "connect-src 'self' ws:");
    next();
});

app.use(session({
    name: "session",
    secret: process.env.SECRET,
    saveUninitialized: true,
    resave: false,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24
    }
}));

app.use(bodyParser.json());

server.listen(process.env.PORT);

console.log(`started on port ${process.env.PORT}`);

app.use(express.static(__dirname + "/../public"));

module.exports.a = app;
module.exports.io = io;