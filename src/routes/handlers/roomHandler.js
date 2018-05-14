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
    async validateGroupRoom(bookings, scheduleTimeEdit, room, currentTime) {
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
            let hej = bookings.filter((x) => {
                return x.roomID === room.name;
            })

            let booking = hej.sort((a, b) => a.startTime.localeCompare(b.startTime));

            if (booking.length > 0) {
                if (this.isRoomBookedInDB(booking[0], room, currentTime)) { 
                    if (this.hasBookingExpired(booking[0], currentTime)) {
                        console.log(booking[0].roomID + ' har expirat och tas nu bort. (' + booking[0].startTime + '-' + getEndTimeForBooking(booking[0]) + ') ' + booking[0].bookingDate)
                        await this.removeBookingFromDB(booking.roomID);
                    } else {
                        //Kör bara metoden för den bokningen som gäller först, inte den sista
                        roomToBeValidated.available = this.isRoomAvailable(booking[0], currentTime);

                        roomToBeValidated.bookings.push({
                            startTime: booking[0].startTime, 
                            endTime: booking[0].endTime,
                            bookingDate: booking[0].bookingDate
                        })
                        roomToBeValidated.bookings.sort((a, b) => a.startTime.localeCompare(b.startTime));
                    }
                }
            }
        }
        return roomToBeValidated;
    }

    getCompleteScheduleToday(room) {
            return new Promise((resolve, reject) => {

                this.getSpecificScheduleTimeEdit(room);

                timeEdit.getTodaysSchedule(req.params.roomID)
                        .then(async (roomSchedule) => {
                            let schedule = [];
                            let booking = await Room.getSpecificBooking(req.params.roomID);
                            
                            if (booking.length > 0 && booking[0].bookingDate === moment().format('YYYY-MM-DD')) {
                                booking.map((x) => {
                                    schedule.push({
                                        username: x.username,
                                        startTime: x.startTime,
                                        endTime: x.endTime
                                    })
                                })
                            }

                            if (roomSchedule) {
                                schedule.push({
                                    username: 'timeedit',
                                    startTime: roomSchedule[0].time.startTime,
                                    endTime: roomSchedule[0].time.endTime
                                });
                            }
                            
                            //res.send(JSON.stringify(schedule, null, 2));
                        }).catch((er) => {
                            console.log(er);
                        });
                    })
                
    }

    isRoomAvailable(booking, currentTime) {
        if (booking.bookingDate > moment().format('YYYY-MM-DD')) {
            //den är ledig
            return true;
        } else if (booking.bookingDate === moment().format('YYYY-MM-DD')) {
            //Idag, jämför tiden.
            if(booking.startTime <= currentTime && booking.endTime >= currentTime) {
                return false;
            } else {
                return true;
            }
        } else {
            console.log('här ska den inte gå in, hehe');
        }
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
                        timeEditschedule.startTime = roomSchedule[0].time.startTime;
                        timeEditschedule.endTime = roomSchedule[0].time.endTime;
                        timeEditschedule.isNull = false;
                    } else {
                        timeEditschedule.room = room.name;
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

    getSpecificScheduleTimeEditByDate(room, date) {
        return timeEdit.getScheduleByDate(room, new Date(date))
        .then((roomSchedule) => {
            return roomSchedule;
        }).catch((er) => {
            console.log(er);
        });
    }
};
