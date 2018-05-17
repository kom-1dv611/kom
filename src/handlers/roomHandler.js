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

    async validateGroupRoom(bookings, room, currentTime) {
        let grouproom = {room};

        //Är grupprummet bokat i timeedit så sätt tillgänglighet baserat på statusen.
        let timeedit = await this.getSpecificScheduleTimeEdit(room.name);
        this.isRoomBookedInTimeEdit(timeedit, currentTime) ? grouproom.available = false : grouproom.available = true;
        
        //Filtrerar ut den tidigaste bokningen så att man ser om rummet är tillgängligt eller inte JUST NU. Tar även bort expirade bokningar.
        if (bookings.length) {
            let roomBookings = bookings.filter((x) => x.roomID === room.name && x.bookingDate === moment().format('YYYY-MM-DD'));
            let earliestBooking = roomBookings.sort((a, b) => a.startTime.localeCompare(b.startTime))[0];

            if (roomBookings.length > 0) {
                this.hasBookingExpired(earliestBooking, currentTime) ? await this.removeBookingFromDB(earliestBooking.roomID) : grouproom.available = this.isRoomAvailable(earliestBooking, currentTime);
            }
        }
        return grouproom;
    }

    getCompleteScheduleToday(room) {
        return timeEdit.getTodaysSchedule(room)
            .then(async (roomSchedule) => {
                let schedule = [];
                let booking = await this.getSpecificBooking(room);
                if (booking.length > 0 && booking[0].bookingDate === moment().format('YYYY-MM-DD')) {
                    booking.map((x) => {
                        schedule.push({username: x.username, startTime: x.startTime, endTime: x.endTime, bookingDate: x.bookingDate});
                    })
                }
                if (roomSchedule) {
                    schedule.push({username: 'timeedit', startTime: roomSchedule[0].time.startTime, endTime: roomSchedule[0].time.endTime, bookingDate: moment().format('YYYY-MM-DD')});
                }
                return schedule.sort((a, b) => a.startTime.localeCompare(b.startTime));
            }).catch((er) => {
                console.log(er);
            });
    }

    isRoomAvailable(booking, currentTime) {
        if (booking.bookingDate > moment().format('YYYY-MM-DD')) return true;
        if (booking.bookingDate === moment().format('YYYY-MM-DD')) return booking.startTime <= currentTime && booking.endTime >= currentTime ? false : true;
    }

    hasBookingExpired(booking, currentTime) {
        if (booking.bookingDate < moment().format('YYYY-MM-DD')) return true;
        if (booking.bookingDate === moment().format('YYYY-MM-DD')) return booking.endTime < currentTime ? true : false; //BUG: Om en bokning går över midnatt så går det ej att jämföra endTime < currentTime
    }

    isRoomBookedInTimeEdit(timeedit, currentTime) {
        return timeedit === null || currentTime < timeedit.startTime || currentTime > timeedit.endTime ? false : true;
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

    //Get specific booking from DB
    getSpecificBooking(roomID) {
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
