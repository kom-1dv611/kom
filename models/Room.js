let mongoose = require('mongoose');

let roomSchema = mongoose.Schema({
    name: {type: String, required: true},
    city: {type: String, required: true},
    type: {type: String, required: true},
    floor_type: {type: String, required: true},
    floor_level: {type: String, required: true},
    location: {type: String, required: true}
});

let Room = mongoose.model('Room', roomSchema);

module.exports = Room;