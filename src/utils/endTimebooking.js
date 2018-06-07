'use strict';

module.exports = function(booking) {
    let startTime = booking.startTime;
    let hour = startTime.substring(0, 2);
    let parsedHour = parseInt(hour);
    let parsedDuration = parseInt(booking.duration);
    let endTimeHour = parsedHour + parsedDuration;
    let minutes = startTime.substring(3, 6);
   
    if(endTimeHour >= 1 && endTimeHour <= 9) {
        endTimeHour = '0' + endTimeHour;
    }

    if(endTimeHour === 24) {
        endTimeHour = '01';
    } else if(endTimeHour === 25) {
        endTimeHour = '02';
    } else if(endTimeHour === 26) {
        endTimeHour = '03';
    }
    return endTimeHour + ':' + minutes;
}
