const app = require("../routes/server").a;
const io = require("../routes/server").io;

app.get("/", function(req, res) {
    res.render("index");
});
