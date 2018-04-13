let mongoose = require('mongoose');

let roomSchema = mongoose.Schema({
    username: {type: String, required: true},
    time: {type: String, required: true} 
});

let Room = mongoose.model('Room', roomSchema);

module.exports = Room;