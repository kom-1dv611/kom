'use strict';

let RoomHandler = require('./handlers/RoomHandler');

const Scraper = require('../libs/scraper');
const getEndTimeForBooking = require('./utils/endTimebooking');
const buildTable = require('./utils/buildTable');

const timeEditApi = require('timeeditApi');
const timeEdit = timeEditApi('https://se.timeedit.net/web/lnu/db1/schema1/', 4);

let router = require("express").Router();
let moment = require('moment');
moment.locale('sv');

module.exports = function (RoomModel, BookingModel) {
    let Room = new RoomHandler(RoomModel, BookingModel);

    router.route('/')
        .get(async function (req, res) {
            let rooms = await Room.getRoomsFromDB();
            let bookings = await Room.getBookingsFromDB();
            let timeEditSchedules = await Room.getScheduleFromTimeEdit(rooms).then((allSchedules) => allSchedules.sort((a, b) => a.room.localeCompare(b.room)));
            let currentTime = moment().format('LT');

            let promises = rooms.map((room, index) => {
                return new Promise((resolve, reject) => {
                    let validatedRoom = Room.validateGroupRoom(bookings, timeEditSchedules[index], room, currentTime);
                    resolve(validatedRoom);
                })
            })

            return Promise.all(promises)
                .then((groupRooms) => {
                    let table = buildTable(groupRooms);
                    return res.status(200).json({ rows: table });
                }).catch((error) => {
                    console.log(error)
                })
        })

    router.route('/:id')
        .get(async function (req, res) {
            let room = {};
            room.id = req.params.id;
            let currentTime = moment().format('LT');

            let booking = await Room.getSpecificBooking(req.params.id);
            if (booking.length > 0) {
                let startTime = booking[0].startTime;
                
                if (startTime > currentTime || booking[0].endTime < currentTime) {
                    room.available = true;
                } else {
                    room.available = false;
                    room.willBeAvailable = booking[0].endTime;
                }
            } else {
                let roomSchedule = await Room.getSpecificScheduleTimeEdit(room);

                if (roomSchedule === null || currentTime < roomSchedule[0].time.startTime) { 
                    room.available = true 
                }  else if (currentTime > roomSchedule[0].time.startTime) { 
                    room.available = false; 
                    room.willBeAvailable = roomSchedule[0].time.endTime; 
                }
            }

            res.json({ room: room });
        })
        .post(async function (req, res) {
            console.log(req.body);
            //3. else om det inte finns bokningar i databas eller timeEdit
            if(req.body.cancel) {
                BookingModel.findOneAndRemove({roomID: req.body.room}, function(err, room) {
                    if(err) {
                        console.log(err)
                    } else {
                        console.log('Booking successfully deleted from DB.');
                        return res.status(200).json({message: 'Booking successfully deleted from DB.'});
                    }
                })
            } else {
                let data = {
                    username: req.body.username,
                    roomID: req.body.room,
                    startTime: req.body.time,
                    duration: req.body.duration,
                    endTime: getEndTimeForBooking({startTime: req.body.time, duration: req.body.duration}),
                    bookingDate: moment().format('YYYY-MM-DD')
                }

                if (req.body.bookingDate) {
                    data.bookingDate = req.body.bookingDate;
                }

                BookingModel.find({roomID: req.body.room}, function(err, bookings) {
                    if(err) {
                        console.log(err);
                    } else {             
                        if(bookings) {
                            for(let i = 0; i < bookings.length; i++) {
                                if(data.endTime > bookings[i].startTime || data.startTime < bookings[i].endTime) {
                                    console.log('felmeddelande')
                                } else {
                                    let bookRoom = new BookingModel(data)
                                    bookRoom.save((err) => {
                                        if (!err) {
                                            console.log('Booking saved in DB.')
                                            return res.status(200).json({message: 'Booking successfully saved in DB.'});
                                        }
                                    })
                                }
                            }
                            
                        }
                    }
                })
              
                
                let times = [];
                //kolla timeEdit efter bokningar
                timeEdit.getTodaysSchedule(req.body.room)
                .then((roomSchedule) => {
                    if (roomSchedule) {
                        for(let i = 0; i < roomSchedule.length; i++) {
                            let booking = {
                                'booking': i,
                                'startTime': roomSchedule[i].time.startTime,
                                'endTime': roomSchedule[i].time.endTime
                            }
                            times.push(booking);
                        }
                        for(let i = 0; i < times.length; i++) {
                            if(data.endTime > times[i].startTime || data.startTime < times[i].endTime) {
                                console.log('felmeddelande')
                            } else {
                                let bookRoom = new BookingModel(data)
                                bookRoom.save((err) => {
                                    if (!err) {
                                        console.log('Booking saved in DB.')
                                        return res.status(200).json({message: 'Booking successfully saved in DB.'});
                                    }
                                })
                            }
                        }
                    }                    
                }).catch((er) => {
                    console.log(er);
                });

                //ska vara i en else sen
                let bookRoom = new BookingModel(data)
                bookRoom.save((err) => {
                    if (!err) {
                        console.log('Booking saved in DB.')
                        return res.status(200).json({message: 'Booking successfully saved in DB.'});
                    }
                }) 
            }   
        });

    router.route('/:roomID/schedule/today')
        .get(function (req, res) {
            timeEdit.getTodaysSchedule(req.params.roomID)
                .then((roomSchedule) => {
                    //todo: interna bokningssystemet
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

    return router;
}
