'use strict';

let express = require('express');

let exphbs = require('express-handlebars');
let bodyParser = require('body-parser');
let path = require('path');
let socket = require('socket.io');

let port = 2000;
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);

const mongoose = require('mongoose')
let Room = require('./models/Room')
let RoomModel = mongoose.model('Room')

require('./config/database').initialize();

app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs'
}));
app.set('view engine', '.hbs');
 

//Static files
app.use(express.static(path.join(__dirname, 'public')));

// io.on('connection', function(socket){
//     console.log('ws connected');

//     socket.on('disconnect', function(){
//         console.log('ws disconnected');
//     });
// });

//the req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


//Routes
let routes = require('./routes/routes')(RoomModel);  
app.use('/', routes);


//Web server
http.listen(port, function(){
    console.log("Express started on http://localhost:" + port);
    console.log("Press Ctrl-C to terminate...");
});