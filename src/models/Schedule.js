let mongoose = require('mongoose');

let scheduleSchema = mongoose.Schema({
    room: {type: String, required: true},
    available: {type: String, required: true},
    startTime: {type: String, required: false},
    endTime: {type: String, required: false},
});

let Schedule = mongoose.model('Schedule', scheduleSchema);

module.exports = Schedule;