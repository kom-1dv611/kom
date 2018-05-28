'use strict';

const getEndTimeForBooking = require('../utils/endTimebooking');
const timeEditApi = require('timeeditapi');
const timeEdit = timeEditApi('https://se.timeedit.net/web/lnu/db1/schema1/', 4);
let moment = require('moment');

console.log("bla");

module.exports = class RoomHandler {
    constructor(RoomModel, BookingModel) {
        this.RoomModel = RoomModel;
        this.BookingModel = BookingModel;
    }

    async validateGroupRoom(bookings, room, currentTime) {
        let grouproom = {room};

        let roomBookings = bookings.filter((x) => x.roomID === room.name);
        roomBookings.map(async (booking) => {
            if (this.hasBookingExpired(booking, currentTime)) {
                await this.removeBookingWithStartTime(booking);
            }
        })
        
        let schedule = await this.getCompleteScheduleToday(room.name);

        if(schedule.length > 0) {
            let bookingsToday = schedule.filter((x) => x.bookingDate === moment().format('YYYY-MM-DD'));
            let currentBooking = bookingsToday.sort((a, b) => a.startTime.localeCompare(b.startTime))[0];
            grouproom.available = currentBooking.startTime <= currentTime && currentBooking.endTime >= currentTime ?  false : true;
        } else {
            grouproom.available = true;
        }
        grouproom.schedule = schedule;

        return grouproom;
    }

    hasBookingExpired(booking, currentTime) {
        //BUG: Om en bokning går över midnatt så går det ej att jämföra endTime < currentTime
        return booking.bookingDate < moment().format('YYYY-MM-DD') || booking.bookingDate === moment().format('YYYY-MM-DD') && booking.endTime < currentTime ? true : false;
    }

    //Remove booking by room name
    removeBookingFromDB(roomID) {
        return this.BookingModel.find({roomID}).remove().exec()
        .then((result) => {
            console.log('Successfully removed ' + roomID + ' booking from DB!');
            return result;
        }).catch((err) => {
            console.log(err)
        })
    }

    //Remove booking with room name and startTime
    removeBookingWithStartTime(room) {
        return this.BookingModel.findOneAndRemove({roomID: room.roomID, startTime: room.startTime})
        .then((result) => {
            console.log('Successfully removed ' + room.roomID + ' booking from DB');
            return result;
        }).catch((err) => {
            console.log(err);
        })
    }

    getCompleteScheduleToday(room) {
        return timeEdit.getTodaysSchedule(room)
            .then(async (roomSchedule) => {
                let schedule = [];
                let bookings = await this.getBookingsForSpecificRoom(room);
                bookings.map((x) => {
                    if (x.bookingDate === moment().format('YYYY-MM-DD')) {
                        schedule.push({username: x.username, startTime: x.startTime, endTime: x.endTime, bookingDate: x.bookingDate, isBookLater: x.isBookLater});
                    }
                })
                
                if (roomSchedule) {
                    schedule.push({username: 'timeedit', startTime: roomSchedule[0].time.startTime, endTime: roomSchedule[0].time.endTime, bookingDate: moment().format('YYYY-MM-DD'), isBookLater: false});
                }
                
                // if (schedule.length > 0) {
                //     schedule.sort((a, b) => a.startTime.localeCompare(b.startTime));
                // }

                return schedule.sort((a, b) => a.startTime.localeCompare(b.startTime));;
            }).catch((er) => {
                console.log(er);
            });
    }

    //Get all bookings for a specific room from DB
    getBookingsForSpecificRoom(roomID) {
        return this.BookingModel.find({roomID}).exec()
        .then((booking) => {
            return booking;
        }).catch((err) => {
            console.log(err)
        })
    }

    //Returns array of all grouprooms from DB
    getRoomsFromDB() {
        return this.RoomModel.find({}).exec()
        .then((rooms) => {
            return rooms.sort((a, b) => a.name.localeCompare(b.name));
        }).catch((err) => {
            console.log(err)
        })
    }

    //Returns array of all bookings from DB
    getBookingsFromDB() {
        return this.BookingModel.find({}).exec()
        .then((bookings) => {
            return bookings;
        }).catch((err) => {
            console.log(err)
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
