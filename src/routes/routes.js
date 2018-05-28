'use strict';

let RoomHandler = require('../handlers/roomHandler');

const Scraper = require('../libs/scraper');
const getEndTimeForBooking = require('../utils/endTimebooking');
const buildTable = require('../utils/buildTable');
const add15MinutesToTime = require('../utils/addMinutesToTime');

const timeEditApi = require('timeeditApi');
const timeEdit = timeEditApi('https://se.timeedit.net/web/lnu/db1/schema1/', 4);

let router = require("express").Router();
let moment = require('moment');
moment.locale('sv');

module.exports = function (RoomModel, BookingModel) {
    let Room = new RoomHandler(RoomModel, BookingModel);

    router.route('/rooms')
        .get(async function (req, res) {
            let rooms = await Room.getRoomsFromDB();
            let bookings = await Room.getBookingsFromDB();
            let currentTime = moment().format('LT');

            let promises = rooms.map((room, i) => {
                return new Promise((resolve, reject) => {
                    let validatedRoom = Room.validateGroupRoom(bookings, room, currentTime);
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

    router.route('/room/:id')
        .get(async function (req, res) {
            let schedule = await Room.getCompleteScheduleToday(req.params.id);
            let currentTime = moment().format('LT');
            let room = {name: req.params.id, schedule};

            /*
            if(schedule.length > 0) {
                let bookingsToday = schedule.filter((x) => x.bookingDate === moment().format('YYYY-MM-DD'));
                let currentBooking = bookingsToday.sort((a, b) => a.startTime.localeCompare(b.startTime))[0];

                if (currentBooking.isBookLater) {
                    console.log('isBookLater')
                    BookingModel.findOne({roomID: req.params.id}, function(err, booking) {
                        if (!err) {
                            if(booking.hasUserCheckedIn === true) {
                                //SKICKA 200
                                room.available = false;
                                console.log('Nu ska bakgrunden bli röd: false')
                                return res.status(200).json({room});
                            } else if(currentTime > add15MinutesToTime(booking.startTime)) {
                                //KOLLA DATUM OCKSÅ
                                console.log('gick den in här elr: true')
                                BookingModel.findOneAndRemove({roomID: room.name, startTime: booking.startTime}, function(err, result) {
                                    if(!err) {
                                        console.log('deleted from DB')
                                        room.available = true;
                                        return res.status(200).json({room});
                                    }
                                })
                            } else {
                                console.log('här går den in: true')
                                room.available = true;
                                console.log(room);
                                return res.status(200).json({room});
                            }
                        }
                        
                    })
                } else {
                    room.available = currentBooking.startTime <= currentTime && currentBooking.endTime >= currentTime ?  false : true;
                    return res.status(200).json({room});
                }
            } else {
                room.available = true;
                return res.status(200).json({room});
            }
            */

            if(schedule.length > 0) {
                let bookingsToday = schedule.filter((x) => x.bookingDate === moment().format('YYYY-MM-DD'));
                let currentBooking = bookingsToday.sort((a, b) => a.startTime.localeCompare(b.startTime))[0];
                room.available = currentBooking.startTime <= currentTime && currentBooking.endTime >= currentTime ?  false : true;
            } else {
                room.available = true;
            }
            res.status(200).json({room});
        })
        .post(async function (req, res) {
            if(req.body.cancel) {
                let allBookings = await Room.getBookingsForSpecificRoom(req.body.room);
                let bookingsToday = [];
                
                for(let i = 0; i < allBookings.length; i++) {
                    if(allBookings[i].bookingDate === moment().format('YYYY-MM-DD')) {
                        bookingsToday.push(allBookings[i]);
                    }
                }
                let currentBooking = bookingsToday.sort((a, b) => a.startTime.localeCompare(b.startTime))[0]; 
                if(currentBooking.username === req.body.username) {
                    await Room.removeBookingWithStartTime(currentBooking);
                    return res.status(200).json({message: 'Success!'});
                } else {
                    return res.status(401).json({message: 'Wrong username.'});
                }          
            } else {
                let currentTime = moment().format('LT');

                let data = {
                    username: req.body.username,
                    roomID: req.body.room,
                    startTime: req.body.time,
                    duration: req.body.duration,
                    endTime: getEndTimeForBooking({startTime: req.body.time, duration: req.body.duration}),
                    bookingDate: moment().format('YYYY-MM-DD')
                }

                let month = JSON.stringify(req.body.date.month)
                if(month.length === 1) {
                    month = '0' + month;
                }

                let date = req.body.date.year + '-' + month + '-' + req.body.date.day;

                if (req.body.bookingDate) {
                    data.isBookLater = true;
                    data.hasUserCheckedIn = false;
                    data.bookingDate = req.body.bookingDate;
                } else {
                    data.isBookLater = false;
                    data.bookingDate = date;
                }

                //Kolla så att man inte kan boka bakåt i tiden
                if (data.bookingDate === moment().format('YYYY-MM-DD') && data.startTime < currentTime || data.bookingDate < moment().format('YYYY-MM-DD')) {
                    return res.status(401).json({message: 'Trying to book a past time.'});
                }

                let status = false;

                let firstPromise = new Promise(async function(resolve, reject) {
                    let bookings = await Room.getBookingsFromDB();
                    let matchBookings = [];
                    if(bookings.length === 0) {
                        status = true;
                    } else {
                        for(let i = 0; i < bookings.length; i++) {
                            if(bookings[i].roomID === req.body.room && bookings[i].bookingDate === data.bookingDate) {
                                matchBookings.push(bookings[i]);
                            } else {
                                status = true;
                            }
                        }
                    }
                    

                    if(status === true && matchBookings.length === 0) {
                        resolve('Success')
                    }

                    let statusWrong = false;
                    let statusRight = false;
                    
                    for(let i = 0; i < matchBookings.length; i++) {
                        if(data.startTime < matchBookings[i].endTime && data.endTime > matchBookings[i].startTime) {                 
                            statusWrong = true;
                        } else {
                            statusRight = true;
                        }
                    }

                    if(statusRight === true && statusWrong === true || statusWrong === true) {
                        reject('Fail')
                    } else if(statusRight === true) {
                        resolve('Success')
                    }
                });

                firstPromise.then(async function(value) {
                    let statusWrong = false;
                    let statusRight = false;
                    if(value === 'Success') {
                        let timeEditBookings = await Room.getSpecificScheduleTimeEditByDate(req.body.room, data.bookingDate);
                        if(timeEditBookings === null) {
                            let bookRoom = new BookingModel(data)
                            bookRoom.save((err) => {
                                if (!err) {
                                    console.log('Booking saved in DB.')
                                    return res.status(200).json({message: 'Booking successfully saved in DB.'});
                                }
                            }) 
                        } else {
                            for(let i = 0; i < timeEditBookings.length; i++) {
                                if(data.startTime < timeEditBookings[i].time.endTime && data.endTime > timeEditBookings[i].time.startTime) {
                                    statusWrong = true;
                                } else {
                                    statusRight = true;
                                }
                            }
                            if(statusWrong === true && statusRight === true || statusWrong === true) {
                                return res.status(401).json({message: 'There is already bookings at this time. See schedule.'});
                            } else if(statusRight === true) {
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
                }).catch(function(error) {
                    console.log(error);
                    return res.status(401).json({message: 'There is already bookings at this time. See schedule.'});
                })
            }   
        });

    router.route('/:roomID/schedule/today')
        .get(async (req, res) => {
            let schedule = await Room.getCompleteScheduleToday(req.params.roomID);
            res.send(JSON.stringify(schedule, null, 2));
        });

    router.route('/checkIn/:room')
        .get(function(req, res) {
            let currentTime = moment().format('LT');
            BookingModel.find({roomID: req.body.room}, function(err, rooms) {
                if(err) {
                    console.log(err)
                } else {
                    //KOLLA DATUM OCKSÅ
                    let booking = rooms.sort((a, b) => a.startTime.localeCompare(b.startTime))[0];
                    if(booking.isBookLater === true) {
                        if(booking.hasUserCheckedIn === true) {
                            //SKICKA 200
                            console.log('Nu ska bakgrunden bli röd')
                        } else if(currentTime > add15MinutesToTime(booking.startTime)) {
                            //KOLLA DATUM OCKSÅ
                            BookingModel.findOneAndRemove({roomID: req.body.room, startTime: booking.startTime}, function(err, result) {
                                if(err) {
                                    console.log(err);
                                } else {
                                    console.log('deleted from DB')
                                }
                            })
                        }
                    }
                }
            })
        })   
        .post(function(req, res) {
            console.log(req.body);
            let currentTime = moment().format('LT');
            BookingModel.findOne({username: req.body.user, roomID: req.body.room}, function(err, booking) {
                if(err) {
                    res.status(500).json(err);
                } else {
                    if(currentTime >= booking.startTime && currentTime <= add15MinutesToTime(booking.startTime)) {
                        booking.hasUserCheckedIn = true;
                        booking.save(function(err, result) {
                            if(err) {
                                res.status(500).json(err);
                            } else {
                                console.log('updated to DB');
                                res.status(200).json({message: 'Check-in'});
                            }
                        })
                        
                    }
                }
            })
        })

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
