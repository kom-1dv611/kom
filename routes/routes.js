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

            let currentTime = moment().format('LT');
            let groupRooms = [];

            let schedules = await getScheduleFromTimeEdit(rooms).then((allSchedules) => allSchedules.sort((a, b) => a.room.localeCompare(b.room)));
            let scheduleTimeEdit = schedules.slice(0);
            
            let index = 0;
            let promises = rooms.map((room) => {
                return new Promise((resolve, reject) => {
                    let validatedRoom = {
                        room
                    }
                    
                    //Kollar om det finns några bokningar i databasen. (Prioritet: Databasbokningar > TimeEdit schema)
                    for (let j = 0; j < bookings.length; j++) {
                        if (isRoomBookedInDB(bookings[j], room, currentTime)) { validatedRoom.available = false; }
                    }
    
                    //Om rummet inte är bokat i databasen så går det efter TimeEdit schemat
                    if (!validatedRoom.hasOwnProperty('available')) {
                        if (scheduleTimeEdit[index].isNull || currentTime < scheduleTimeEdit[index].startTime || currentTime > scheduleTimeEdit[index].endTime) {
                            validatedRoom.available = true;
                        } else {
                            validatedRoom.available = false;
                        }
                    }
                    groupRooms.push(validatedRoom);
                    index++;
                    resolve(validatedRoom);
                })
            })

            return Promise.all(promises)
                .then((schedules) => {
                    getRoomStatus(bookings, schedules); //TODO: implementera allting i metoden
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


    //Sätter ett rums tillgänglighet baserat på: Bokning i DB > TimeEdit
    function getRoomStatus(bookings, correctSchedule) {
        let currentTime = moment().format('LT');
        if (bookings.length) {
            for (let i = 0; i < bookings.length; i++) {
                for (let j = 0; j < correctSchedule.length; j++) {
                    let endTime = getEndTimeForBooking(bookings[i]);
                    let startTime = bookings[i].startTime;
                
                    //Kolla ifall rummet är bokat i databasen eller inte
                    if (bookings[i].roomID.includes(correctSchedule[j].room)) {
                        
                        //Om bokningen är gammal så ta bort den, annars så är rummet bokat för tillfället. 
                        if (startTime > currentTime || endTime < currentTime) {
                            BookingModel.remove({_id: bookings[i]._id}, (err, result) => {
                                console.log('Successfully removed expired booking ' +  bookings[i].roomID + ' (' + bookings[i].startTime + '-' + endTime + ') from DB.')
                            })
                        } else {
                            console.log(correctSchedule[j].room + ' är bokat (' + bookings[i].startTime + '-' + endTime + ') i MongoDB.')
                            correctSchedule[j].available = false;
                        }
                    } 
                }
            }
        }
    }

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

    function isRoomBookedInDB(booking, room, currentTime) {
        if (booking.roomID === room.name) {
            let endTime = getEndTimeForBooking(booking);
            let startTime = booking.startTime;
            
            if (startTime > currentTime || endTime < currentTime) {
                //Gammal, expirad bokning
                return false;
            } else {
                console.log(room.name + ' är bokat (' + booking.startTime + '-' + endTime + ') i MongoDB.')
                return true;
            }
        }
        return false;
    }

    function getRoomsFromDB() {
        return RoomModel.find({}).exec()
        .then((rooms) => {
            return rooms;
        }).catch((err) => {
            console.log(err)
        })
    }

    function getBookingsFromDB() {
        return BookingModel.find({}).exec()
        .then((bookings) => {
            return bookings;
        }).catch((err) => {
            console.log(err)
        })
    }

    function updateScheduleDB(schedule, availability) {
        schedule.set({ available: availability });
        schedule.save((err, updatedSchedule) => {
            if (!err) {
                console.log('Updated ' + updatedSchedule.room + ' in DB.')
            }
        })
    }

    function getScheduleFromDB() {
        return ScheduleModel.find({}).exec()
        .then((schedules) => {
            return schedules.sort((a, b) => a.room.localeCompare(b.room));
        }).catch((err) => {
            console.log(err)
        })
    }

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

    return router;
}
