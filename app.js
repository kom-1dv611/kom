'use strict';

let express = require('express');

let exphbs = require('express-handlebars');
let bodyParser = require('body-parser');
let path = require('path');
let socket = require('socket.io');
let session = require('express-session');
let cookieParser = require('cookie-parser')


let port = 2000;
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);

const mongoose = require('mongoose')
let Booking = require('./models/Booking').model('Booking')
let Room = require('./models/Room').model('Room');

let Handlebars = require("handlebars");
let ngrok = require('ngrok');

async function getPublicUrl() {
    console.log("Public url: " + await ngrok.connect(port));
}

getPublicUrl();

require('./config/database').initialize();

app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs'
}));
app.set('view engine', '.hbs');

app.get('/favicon.ico', function (req, res) {
    res.status(204);
});

Handlebars.registerHelper( 'loop', function( from, to, inc = 1, block ) {
    let toReturn = "";
    for(let i = from; i <= to; i++) {
        toReturn += block.fn(i * inc);
    }
    return toReturn;
});


//Static files
app.use(express.static(path.join(__dirname, 'public')));

//the req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


//Routes
let routes = require('./routes/routes')(Room, Booking);  
app.use('/', routes);


//Web server
http.listen(port, function(){
    console.log("Express started on http://localhost:" + port);
    console.log("Press Ctrl-C to terminate...");
});