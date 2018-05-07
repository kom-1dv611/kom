'use strict';

let express = require('express');
let bodyParser = require('body-parser');
let path = require('path');
let socket = require('socket.io');

let port = 2000;
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);

const mongoose = require('mongoose')
let BookingModel = require('./src/models/Booking').model('Booking')
let RoomModel = require('./src/models/Room').model('Room');
let ScheduleModel = require('./src/models/Schedule').model('Schedule');

let ngrok = require('ngrok');

async function getPublicUrl() {
    console.log("Public url: " + await ngrok.connect(port));
}

getPublicUrl();

require('./src/config/database').initialize();

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

let scrape = require('./src/libs/infoScraper')
app.get('/scrape', function (req, res) {
    scrape().then((value) => {
        res.send(value)
    })
})

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let routes = require('./src/routes/routes')(RoomModel, BookingModel, ScheduleModel);  
app.use('/', routes);

http.listen(port, function() {
    console.log("Express started on http://localhost:" + port);
    console.log("Press Ctrl-C to terminate...");
});
