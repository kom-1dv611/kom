'use strict';

module.exports = function(time) {
    let hour = parseInt(time.substring(0, 2));
    let minutes = parseInt(time.substring(3, 6));
    let modifiedTime = minutes + 15;
    function modifier(x) {
        hour += 1;
        if(hour >= 1 && hour <= 9) hour = '0' + hour;
        if(hour === 24) hour = '01';
        modifiedTime = x + modifiedTime.toString().substring(1, 2);
    }
    if (modifiedTime >= 60 && modifiedTime < 70) modifier(0);
    else if (modifiedTime > 70 && modifiedTime <= 74) modifier(1);
    return hour + ':' + modifiedTime;
}