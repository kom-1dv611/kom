let mongoose = require('mongoose');

let roomSchema = mongoose.Schema({
    username: {type: String, required: true},
    room: {type: String, required: true},
    bookingLength: {type: Number, required: true},
    startTime: {type: String, required: true} 
});

let Room = mongoose.model('Room', roomSchema);

module.exports = Room;
