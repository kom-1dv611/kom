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

    async validateGroupRoom(bookings, scheduleTimeEdit, room, currentTime) {
        let roomToBeValidated = { room, bookings: [] }

        //Är grupprummet bokat i timeedit så sätt tillgänglighet baserat på statusen.
        this.isRoomBookedInTimeEdit(scheduleTimeEdit, currentTime, roomToBeValidated) ? roomToBeValidated.available = false : roomToBeValidated.available = true; 

        //Filtrerar ut den "första" bokningen, så att man ser om rummet är tillgängligt eller inte JUST NU. Tar även bort expirade bokningar.
        if (bookings.length) {

            let roomBookings = bookings.filter((x) => x.roomID === room.name && x.bookingDate === moment().format('YYYY-MM-DD'));
            //if (x.roomID === room.name && x.bookingDate === moment().format('YYYY-MM-DD')) return x;
            let earliestBooking = roomBookings.sort((a, b) => a.startTime.localeCompare(b.startTime))[0];

            if (roomBookings.length > 0) {
                if (this.isRoomBookedInDB(earliestBooking, room, currentTime)) { 
                    if (this.hasBookingExpired(earliestBooking, currentTime)) {
                        console.log(earliestBooking.roomID + ' har expirat och tas nu bort. (' + earliestBooking.startTime + '-' + getEndTimeForBooking(earliestBooking) + ') ' + earliestBooking.bookingDate)
                        await this.removeBookingFromDB(earliestBooking.roomID);
                    } else {
                        roomToBeValidated.available = this.isRoomAvailable(earliestBooking, currentTime);
                    }
                }
            }
        }

        //Sätter dagens schema för ett grupprum
        roomToBeValidated.bookings = await this.getCompleteScheduleToday(room.name);

        return roomToBeValidated;
    }

    getCompleteScheduleToday(room) {
        return new Promise((resolve, reject) => {
            timeEdit.getTodaysSchedule(room)
                    .then(async (roomSchedule) => {
                        let schedule = [];
                        let booking = await this.getSpecificBooking(room);
                        
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

                        resolve(schedule);

                        return schedule;
                        
                        //res.send(JSON.stringify(schedule, null, 2));
                    }).catch((er) => {
                        console.log(er);
                        reject('');
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

    isRoomBookedInTimeEdit(scheduleTimeEdit, currentTime, roomToBeValidated) {
        if (!roomToBeValidated.hasOwnProperty('available')) {
            return scheduleTimeEdit.isNull || currentTime < scheduleTimeEdit.startTime || currentTime > scheduleTimeEdit.endTime ? false : true;
        } 
        return false;
    }

    isRoomBookedInDB(booking, room, currentTime) {
        return booking.roomID === room.name ? true : false;
    }

    removeBookingFromDB(id) {
        return this.BookingModel.find({ roomID: id }).remove().exec()
        .then((result) => {
            return result;
        }).catch((err) => {
            console.log(err)
        })
    }

    hasBookingExpired(booking, currentTime) {
        if (booking.bookingDate < moment().format('YYYY-MM-DD')) {
            return true;
        } else if (booking.bookingDate === moment().format('YYYY-MM-DD')) {
            return booking.endTime < currentTime ? true : false;
        }
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
