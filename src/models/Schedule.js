let mongoose = require('mongoose');

let scheduleSchema = mongoose.Schema({
    room: {type: String, required: true},
    isAvailable: {type: Boolean, required: true},
    bookings: [
        {
            startTime: {type: String, required: false},
            endTime: {type: String, required: false},
        }
    ]
});

let Schedule = mongoose.model('Schedule', scheduleSchema);

module.exports = Schedule;