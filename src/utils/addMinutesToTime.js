'use strict';

module.exports = function(time, minutesToAdd) {
    let hour = parseInt(time.substring(0, 2));
    let minutes = parseInt(time.substring(3, 6));
    let modifiedTime = minutes + minutesToAdd;

    if(modifiedTime === 60) {
        modifiedTime = '00';
        hour = hour + 1;
    } else if(modifiedTime === 61) {
        modifiedTime = '01';
        hour = hour + 1;
    } else if(modifiedTime === 61) {
        modifiedTime = '02';
        hour = hour + 1;
    } else if(modifiedTime === 62) {
        modifiedTime = '03';
        hour = hour + 1;
    } else if(modifiedTime === 63) {
        modifiedTime = '04';
        hour = hour + 1;
    } else if(modifiedTime === 64) {
        modifiedTime = '05';
        hour = hour + 1;
    } else if(modifiedTime === 65) {
        modifiedTime = '06';
        hour = hour + 1;
    } else if(modifiedTime === 66) {
        modifiedTime = '07';
        hour = hour + 1;
    } else if(modifiedTime === 67) {
        modifiedTime = '08';
        hour = hour + 1;
    } else if(modifiedTime === 68) {
        modifiedTime = '09';
        hour = hour + 1;
    } else if(modifiedTime === 69) {
        modifiedTime = 10;
        hour = hour + 1;
    } else if(modifiedTime === 70) {
        modifiedTime = 11;
        hour = hour + 1;
    } else if(modifiedTime === 71) {
        modifiedTime = 12;
        hour = hour + 1;
    } else if(modifiedTime === 72) {
        modifiedTime = 13;
        hour = hour + 1;
    } else if(modifiedTime === 73) {
        modifiedTime = 14;
        hour = hour + 1;
    }
    
    return hour + ':' + modifiedTime;
}