const app = require("../routes/server").a;
const io = require("../routes/server").io;

const timeEditApi = require('timeeditApi');

const timeEdit = timeEditApi(
    'https://se.timeedit.net/web/lnu/db1/schema1/', // url 
    4                                               // type 
);

app.get("/", function(req, res) {
    res.render("index");
});

app.get("/:id", function(req, res) {
    res.render("room", {room: req.params.id});
});

async function exists(room) {
    return await timeEdit.search(room);
}

async function search(room) {
    let toReturn = undefined;
    if(exists(room)) {
        toReturn = await timeEdit.getSchedule(room);
    } else {
        console.log("Room does not exist!");
    }
    return toReturn;
}

async function demo() {
    console.log(await search("Ny208K"));
}

demo();

