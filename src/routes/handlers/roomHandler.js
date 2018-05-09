'use strict';

const getEndTimeForBooking = require('../utils/endTimebooking');
const timeEditApi = require('timeeditApi');
const timeEdit = timeEditApi('https://se.timeedit.net/web/lnu/db1/schema1/', 4);
let moment = require('moment');

module.exports = class RoomHandler {
    constructor(RoomModel, BookingModel) {
        this.RoomModel = RoomModel;
        this.BookingModel = BookingModel;
    }

    //Determines if a room is CURRENTLY truly available or not (based on db bookings and timeedit bookings)
    /**
     * {bookings} - Array of bookings from DB
     * {scheduleTimeEdit} - Object representing a rooms timeedit schedule
     * {room} - Object representing the room to be validated
     * {currentTime} - momentJS current localtime
     */
    validateGroupRoom(bookings, scheduleTimeEdit, room, currentTime) {
        let roomToBeValidated = { room, bookings: [] }

        if (this.isRoomBookedInTimeEdit(scheduleTimeEdit, currentTime, roomToBeValidated))  { 
            roomToBeValidated.available = false; 
            roomToBeValidated.bookings.push({
                startTime: scheduleTimeEdit.startTime, 
                endTime: scheduleTimeEdit.endTime,
                bookingDate: moment().format('YYYY-MM-DD')
            })
        } else { 
            roomToBeValidated.available = true; 
        }

        //Kollar om det finns några bokningar i databasen och tar bort gamla bokningar
        if (bookings.length) {
            bookings.map(async (booking) =>  {
                if (this.isRoomBookedInDB(booking, room, currentTime)) { 
                    if (this.hasBookingExpired(booking, currentTime)) {
                        console.log(booking.roomID + ' har expirat och tas nu bort. (' + booking.startTime + '-' + getEndTimeForBooking(booking) + ') ' + booking.bookingDate)
                        //await this.removeBookingFromDB(booking.roomID);
                    } else {
                        roomToBeValidated.available = booking.startTime > currentTime ? true : false;

                        roomToBeValidated.bookings.push({
                            startTime: booking.startTime, 
                            endTime: booking.endTime,
                            bookingDate: booking.bookingDate
                        })
                        roomToBeValidated.bookings.sort((a, b) => a.startTime.localeCompare(b.startTime));
                    }
                }
            })
        }
        return roomToBeValidated;
    }

    checkBookingStatus() {

    }

    //Checks if a room is booked in timeedit. Takes the TimeEdit schedule, current time and the room that is getting validated.
    isRoomBookedInTimeEdit(scheduleTimeEdit, currentTime, roomToBeValidated) {
        if (!roomToBeValidated.hasOwnProperty('available')) {
            return scheduleTimeEdit.isNull || currentTime < scheduleTimeEdit.startTime || currentTime > scheduleTimeEdit.endTime ? false : true;
        } 
        return false;
    }

    //Get specific booking from DB
    getSpecificBooking(id) {
        return this.BookingModel.find({ roomID: id }).exec()
        .then((booking) => {
            return booking;
        }).catch((err) => {
            console.log(err)
        })
    }

    //Remove specific booking from DB
    removeBookingFromDB(id) {
        return this.BookingModel.find({ roomID: id }).remove().exec()
        .then((result) => {
            return result;
        }).catch((err) => {
            console.log(err)
        })
    }

    //Validate if a booking has expired or not based on date and time
    hasBookingExpired(booking, currentTime) {
        if (booking.bookingDate < moment().format('YYYY-MM-DD')) {
            return true;
        } else if (booking.bookingDate === moment().format('YYYY-MM-DD')) {
            return booking.endTime < currentTime ? true : false;
        }
    }

    //checks if a room has a booking in the DB.
    isRoomBookedInDB(booking, room, currentTime) {
        return booking.roomID === room.name ? true : false;
    }

    //Returns array of grouprooms from DB
    getRoomsFromDB() {
        return this.RoomModel.find({}).exec()
        .then((rooms) => {
            return rooms.sort((a, b) => a.name.localeCompare(b.name));
        }).catch((err) => {
            console.log(err)
        })
    }

    //Returns array of bookings from DB
    getBookingsFromDB() {
        return this.BookingModel.find({}).exec()
        .then((bookings) => {
            return bookings;
        }).catch((err) => {
            console.log(err)
        })
    }

    //First booking  ([0]) from TimeEdit schedule for an array of grouprooms
    async getScheduleFromTimeEdit(rooms) {
        let promises = rooms.map((room) => {
            return new Promise((resolve, reject) => {
                timeEdit.getTodaysSchedule(room.name)
                .then((roomSchedule) => {
                    let timeEditschedule = {}; 

                    if (roomSchedule) {
                        timeEditschedule.room = roomSchedule[0].searchId;
                        timeEditschedule.available = false;
                        timeEditschedule.startTime = roomSchedule[0].time.startTime;
                        timeEditschedule.endTime = roomSchedule[0].time.endTime;
                        timeEditschedule.isNull = false;
                    } else {
                        timeEditschedule.room = room.name;
                        timeEditschedule.available = true;
                        timeEditschedule.isNull = true;
                    }
                    resolve(timeEditschedule);
                })
            })
        })
    
        return await Promise.all(promises)
        .then((schedules) => {
            return schedules;
        }).catch((error) => {
            console.log(error)
        })
    }

    getSpecificScheduleTimeEdit(room) {
        return timeEdit.getTodaysSchedule(room)
        .then((roomSchedule) => {
            return roomSchedule;
        }).catch((er) => {
            console.log(er);
        });
    }
};
