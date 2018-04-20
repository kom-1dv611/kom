'use strict';

const Scraper = require('../libs/scraper');

const timeEditApi = require('timeeditApi');
const timeEdit = timeEditApi(
    'https://se.timeedit.net/web/lnu/db1/schema1/', 4
);

let router = require("express").Router();
let roomID;
let moment = require('moment');
moment.locale('sv');

module.exports = function (BookingModel, RoomModel) {

    function getEndTimeForBooking(booking) {
        let startTime = booking.startTime;
        let hour = startTime.substring(0, 2);
        let parsedHour = parseInt(hour);
        let parsedDuration = parseInt(booking.duration);
        let endTimeHour = parsedHour + parsedDuration;
        let minutes = startTime.substring(3, 6);
        
        return endTimeHour + ':' + minutes;
    }

    router.route('/')
        .get(function (req, res) {

            //Körs ej. Används bara för att skrapa grupprummen på lnu.se
            async function scrapeRoomsFromLNU() {
                let rooms = await Scraper();
                let groupRooms = [];

                for (let i = 0; i < rooms.length; i++) {
                    timeEdit.getTodaysSchedule(rooms[i].name)
                        .then((roomSchedule) => {
                            if (roomSchedule === null) {
                                rooms[i].available = true;
                                groupRooms.push(rooms[i])
                            } else if (moment().format('LT') < roomSchedule[0].time.startTime || moment().format('LT') > roomSchedule[0].time.endTime) {
                                rooms[i].available = true;
                                groupRooms.push(rooms[i])
                            } else {
                                rooms[i].available = false;
                                groupRooms.push(rooms[i])
                            }

                            // Save room if it isn't stored in DB already
                            RoomModel.find({ name: rooms[i].name }, (err, room) => {
                                if (!err && !room || !err && !room.length) {
                                    let groupRoom = new RoomModel({
                                        name: rooms[i].name,
                                        city: rooms[i].city,
                                        type: rooms[i].type,
                                        floor_type: rooms[i].floor_type,
                                        floor_level: rooms[i].floor_level,
                                        location: rooms[i].location
                                    });

                                    groupRoom.save((err, savedRoom) => {
                                        if (err) { console.log(err) }
                                        if (savedRoom) { console.log('saved room in db') }
                                    })
                                }
                            })

                            if (i === (rooms.length - 1)) {
                                sendRoomsToClient(groupRooms);
                            }

                        }).catch((er) => {
                            if (i === (rooms.length - 1)) {
                                sendRoomsToClient(groupRooms);
                            }
                        });
                }
            }

            RoomModel.find({})
            .then((rooms) => {
                return rooms;
            })
            .then((rooms) => {
                BookingModel.find({})
                .then((bookings) => {
                    //Här i finns tillgång till alla grupprum samt alla bokningar från databasen (rooms & bookings)
                    let groupRoomsWithAvailability = [];

                    for (let i = 0; i < rooms.length; i++) {                            
                        timeEdit.getTodaysSchedule(rooms[i].name)
                        .then((roomSchedule) => {
                            for (let j = 0; j < bookings.length; j++) {
                                if (bookings[j].roomID === rooms[i].name) {

                                    let endTime = getEndTimeForBooking(bookings[j]);

                                    //Rummet är bokat
                                    if (bookings[j].startTime < endTime) {
                                        rooms[i].available = false;
                                        groupRoomsWithAvailability.push(rooms[i])
                                        console.log(rooms[i].name + ' är bokat (' + bookings[j].startTime + '-' + endTime + ').')
                                    }

                                    //Rensa bort gamla bokningar
                                    if (endTime < moment().format('LT')) {
                                        console.log(bookings[j].roomID + ' (' + bookings[j].startTime + '-' + endTime + ') är en gammal bokning, ta bort den')
                                    }
                                }
                            }

                            if (!rooms[i].hasOwnProperty('available')) {
                                if (roomSchedule === null || moment().format('LT') < roomSchedule[0].time.startTime || moment().format('LT') > roomSchedule[0].time.endTime) {
                                    rooms[i].available = true
                                    groupRoomsWithAvailability.push(rooms[i])
                                } else {
                                    rooms[i].available = false;
                                    groupRoomsWithAvailability.push(rooms[i])
                                }
                            }
                            
                            if (groupRoomsWithAvailability.length === rooms.length) {
                                sendRoomsToClient(groupRoomsWithAvailability)
                            }
                        })
                        .catch((er) => {
                            console.log(er)
                        })
                    }
                })
            })

            function sendRoomsToClient(groupRooms) {
                groupRooms.sort((a, b) => a.name.localeCompare(b.name))
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
                res.render('index', { rows: rows });
            }
        })

    router.route('/:id')
        .get(function (req, res) {
            roomID = req.params.id
            let room = {};
            room.id = req.params.id;

            BookingModel.find({ roomID: req.params.id }, function (err, result) {
                // TODO: ta bort bokning från db om tiden gått ut.
                if (result.length > 0) {
                    let endTime = getEndTimeForBooking(result[0]);
                    let startTime = result[0].startTime;

                    if (startTime > moment().format('LT') || endTime < moment().format('LT')) {
                        room.available = true;
                    } else {
                        room.available = false;
                        room.willBeAvailable = endTime;
                    }
                    res.render("room", { room: room });
                } else {
                    timeEdit.getTodaysSchedule(req.params.id).then((roomSchedule) => {
                        if (roomSchedule === null) {
                            room.available = true
                        } else if (moment().format('LT') > roomSchedule[0].time.startTime) {
                            room.available = false;
                            room.willBeAvailable = roomSchedule[0].time.endTime;
                        }
                    }).then(() => {
                        res.render("room", { room: room });
                    }).catch((er) => {
                        console.log(er);
                    });
                }
            })
        })
        .post(function (req, res) {
            if (req.body.username === undefined) {
                console.log('no username entered')
                req.session.flash = {
                    type: 'fail',
                    message: 'You must write a username'
                };
            } else {
                let data = {
                    username: req.body.username,
                    roomID: roomID,
                    startTime: req.body.time,
                    duration: req.body.duration
                }

                let bookRoom = new BookingModel(data)
                bookRoom.save((err) => {
                    console.log('saved')
                })
            }
            res.redirect('/' + roomID)
        });

    router.route('/:roomID/schedule/today')
        .get(function (req, res) {
            timeEdit.getTodaysSchedule(req.params.roomID)
                .then((roomSchedule) => {
                    // let data = {
                    //     startTime: roomSchedule[0].time.startTime,
                    //     endTime: roomSchedule[0].time.endTime,
                    //     bookingID: roomSchedule[0].bookingId,
                    //     info: roomSchedule[0].columns[2]
                    // }
                    // console.log(data);

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
