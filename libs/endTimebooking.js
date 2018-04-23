'use strict';

module.exports = function(booking) {
    let startTime = booking.startTime;
    let hour = startTime.substring(0, 2);
    let parsedHour = parseInt(hour);
    let parsedDuration = parseInt(booking.duration);
    let endTimeHour = parsedHour + parsedDuration;
    let minutes = startTime.substring(3, 6);
    
    return endTimeHour + ':' + minutes;
}