let mongoose = require('mongoose');

let roomSchema = new mongoose.Schema({
    username: {type: String, required: true},
    room: {type: String, required: true},
    bookingLength: {type: Number, required: true},
    startTime: {type: Date, default: Date.now(), required: true} 
});

let Room = mongoose.model('Room', roomSchema);

module.exports = Room;