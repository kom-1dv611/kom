let mongoose = require('mongoose');

let roomSchema = mongoose.Schema({
    username: {type: String, required: true},
    roomID: {type: String, required: true},
    startTime: {type: String, required: true},
    duration: {type: String, required: true}
});

let Room = mongoose.model('Room', roomSchema);

module.exports = Room;