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

async function search(room) {
    let exists = await timeEdit.search(room)
    if(exists) {
        let schedule = await timeEdit.getSchedule(room);
        console.log(schedule);
    } else {
        console.log("Room does not exist!");
    }
}

search("Ny228K")

