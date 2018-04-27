'use strict';

const Scraper = require('../libs/scraper');
const getEndTimeForBooking = require('../libs/endTimebooking');

const timeEditApi = require('timeeditApi');
const timeEdit = timeEditApi(
    'https://se.timeedit.net/web/lnu/db1/schema1/', 4
);

let router = require("express").Router();
let moment = require('moment');
moment.locale('sv');

module.exports = function (RoomModel, BookingModel, ScheduleModel) {
    router.route('/')
        .get(async function (req, res) {
            let rooms = await getRoomsFromDB();
            let bookings = await getBookingsFromDB();
            let timeEditSchedule = await getScheduleFromTimeEdit(rooms).then((allSchedules) => allSchedules.sort((a, b) => a.room.localeCompare(b.room)));
            let scheduleTimeEdit = timeEditSchedule.slice(0);
            let index = 0;

            let promises = rooms.map((room) => {
                return new Promise((resolve, reject) => {
                    let validatedRoom = validateGroupRoom(bookings, scheduleTimeEdit[index], room);
                    index++;
                    resolve(validatedRoom);
                })
            })

            return Promise.all(promises)
                .then((schedules) => {
                    let table = buildTable(schedules);
                    return res.status(200).render('index', { rows: table });
                }).catch((error) => {
                    console.log(error)
                })
        })

    

    router.route('/:id')
        .get(function (req, res) {
            let room = {};
            room.id = req.params.id;
            let currentTime = moment().format('LT');

            BookingModel.find({ roomID: req.params.id }, function (err, result) {
                if (result.length > 0) {
                    let endTime = getEndTimeForBooking(result[0]);
                    let startTime = result[0].startTime;
                    
                    if (startTime > currentTime || endTime < currentTime) {
                        room.available = true;
                    } else {
                        room.available = false;
                        room.willBeAvailable = endTime;
                    }

                    res.render("room", { room: room });
                } else {
                    timeEdit.getTodaysSchedule(room.id)
                        .then((roomSchedule) => {
                            if (roomSchedule === null || currentTime < roomSchedule[0].time.startTime) { 
                                room.available = true 
                            }  else if (currentTime > roomSchedule[0].time.startTime) { 
                                room.available = false; 
                                room.willBeAvailable = roomSchedule[0].time.endTime; 
                            }

                            res.render("room", { room: room });
                        }).catch((er) => {
                            console.log(er);
                        });
                }
            })
        })
        .post(function (req, res) {
            let data = {
                username: req.body.username,
                roomID: req.body.roomID,
                startTime: req.body.time,
                duration: req.body.duration
            }

            let bookRoom = new BookingModel(data)
            bookRoom.save((err) => {
                console.log('Booking saved in DB.')
                res.redirect('/' + req.body.roomID)
            })
        });

    router.route('/:roomID/schedule/today')
        .get(function (req, res) {
            timeEdit.getTodaysSchedule(req.params.roomID)
                .then((roomSchedule) => {
                    res.send(JSON.stringify(roomSchedule, null, 2));
                }).catch((er) => {
                    console.log(er);
                });
        });

    router.route('/room/:roomID/schedule/')
        .get(function (req, res) {
            // full schedule     
            timeEdit.getSchedule(req.params.roomID)
                .then((schedule) => {
                    let array = [];
                    for (let i = 0; i < schedule.length; i++) {
                        let data = {
                            startTime: schedule[i].time.startTime,
                            endTime: schedule[i].time.endTime,
                            bookingID: schedule[i].bookingId,
                            info: schedule[i].columns[2]
                        }
                        array.push(data);
                    }
                    res.send(JSON.stringify(array, null, 2));
                }).catch((er) => {
                    console.log(er);
                });
        });


    

    //TimeEdit schedule for an array of grouprooms
    async function getScheduleFromTimeEdit(rooms) {
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

    //Returns array of grouprooms from DB
    function getRoomsFromDB() {
        return RoomModel.find({}).exec()
        .then((rooms) => {
            return rooms.sort((a, b) => a.name.localeCompare(b.name));
        }).catch((err) => {
            console.log(err)
        })
    }

    //Returns array of bookings from DB
    function getBookingsFromDB() {
        return BookingModel.find({}).exec()
        .then((bookings) => {
            return bookings;
        }).catch((err) => {
            console.log(err)
        })
    }

    //Updates an existing schedule's available property in DB
    function updateScheduleDB(schedule, availability) {
        schedule.set({ available: availability });
        schedule.save((err, updatedSchedule) => {
            if (!err) {
                console.log('Updated ' + updatedSchedule.room + ' in DB.')
            }
        })
    }

    //Returns array of schedules from DB
    function getScheduleFromDB() {
        return ScheduleModel.find({}).exec()
        .then((schedules) => {
            return schedules.sort((a, b) => a.room.localeCompare(b.room));
        }).catch((err) => {
            console.log(err)
        })
    }

    //Builds table of grouprooms 
    function buildTable(groupRooms) {
        groupRooms.sort((a, b) => a.room.name.localeCompare(b.room.name))
        let size = Math.ceil(groupRooms.length / 3);
        let rows = [];
        for (let i = 0; i < size; i++) {
            rows.push({})
            rows[i].cols = [];
            for (let j = i * 3; j < (i * 3) + 3; j++) {
                if (groupRooms[j] != undefined) {
                    rows[i].cols.push(groupRooms[j]);
                }
            }
        }
        return rows;
    }

    //Determines if a room is truly available or not (based on db bookings and timeedit bookings)
    function validateGroupRoom(bookings, scheduleTimeEdit, room) {
        let currentTime = moment().format('LT');
        let roomToBeValidated = { room }

        if (!isRoomBookedInTimeEdit(scheduleTimeEdit, currentTime, roomToBeValidated))  { roomToBeValidated.available = true; }
        else { roomToBeValidated.available = false; }

        //Kollar om det finns några bokningar i databasen. (Prioritet: Databasbokningar > TimeEdit schema)
        if (bookings.length) {
            for (let j = 0; j < bookings.length; j++) {
                if (isRoomBookedInDB(bookings[j], room, currentTime)) { roomToBeValidated.available = false; }
            }
        }
        return roomToBeValidated;
    }

    //checks if a room has a booking in the DB.
    function isRoomBookedInDB(booking, room, currentTime) {
        if (booking.roomID === room.name) {
            let endTime = getEndTimeForBooking(booking);
            let startTime = booking.startTime;
            
            if (startTime > currentTime || endTime < currentTime) {
                //Gammal, expirad bokning
                console.log(booking.roomID + ' är en gammal bokning.')

                booking.remove((err, result) => {
                    console.log('Deleted expired booking from DB.')
                })
                
                return false;
            } else {
                console.log(room.name + ' är bokat (' + booking.startTime + '-' + endTime + ') i MongoDB.')
                return true;
            }
        } 
        return false;
    }

    //Checks if a room is booked in timeedit. Takes the TimeEdit schedule, current time and the room that is getting validated.
    function isRoomBookedInTimeEdit(scheduleTimeEdit, currentTime, roomToBeValidated) {
        if (!roomToBeValidated.hasOwnProperty('available')) {
            if (scheduleTimeEdit.isNull || currentTime < scheduleTimeEdit.startTime || currentTime > scheduleTimeEdit.endTime) { return false; }
            return true;
        } 
        return false;
    }
    return router;
}
