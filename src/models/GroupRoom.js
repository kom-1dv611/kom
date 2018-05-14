let mongoose = require('mongoose');

let groupRoomSchema = mongoose.Schema({
    name: {type: String, required: true},
    city: {type: String, required: true},
    type: {type: String, required: true},
    floor_type: {type: String, required: true},
    floor_level: {type: String, required: true},
    location: {type: String, required: true},
    bookings: [
        {
            username: String,
            startTime: String,
            endTime: String,
            bookingDate: String
        }
    ]
});

let GroupRooom = mongoose.model('GroupRoom', groupRoomSchema);

module.exports = GroupRooom;