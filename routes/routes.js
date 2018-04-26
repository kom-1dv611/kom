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

            for (let i = 0; i < rooms.length; i++) { 
                timeEdit.getTodaysSchedule(rooms[i].name)
                    .then((roomSchedule) => {
                        let room = {
                            room: rooms[i]
                        }
                        
                        //Kollar om det finns några bokningar i databasen. (Prioritet: Databasbokningar > TimeEdit schema)
                        for (let j = 0; j < bookings.length; j++) {
                            if (isRoomBookedInDB(bookings[j], rooms[i], currentTime)) { room.available = false; }
                        }

                        //Om rummet inte är bokat i databasen
                        if (!room.hasOwnProperty('available')) {
                            if (roomSchedule === null || currentTime < roomSchedule[0].time.startTime || currentTime > roomSchedule[0].time.endTime) {
                                room.available = true;
                            } else {
                                room.available = false;
                            }
                        }
                        groupRooms.push(room);
                               
                        //Annan lösning än denna?
                        if (groupRooms.length === rooms.length) {
                            sendRoomsToClient(groupRooms)
                        }
                    }).catch((er) => {
                        console.log(er)
                    })
            }

            function sendRoomsToClient(groupRooms) {
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
                console.log('____________')
                res.render('index', { rows: rows });
            }
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
                            }  
                            if (currentTime > roomSchedule[0].time.startTime) { 
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


    router.route('/overview/room/updater')
        .get(async function (req, res) {
            let rooms = await getRoomsFromDB();
            let bookings = await getBookingsFromDB();

            let timeEditSchedules = [];
            
            for (let i = 0; i < rooms.length; i++) {
                timeEditSchedules.push(await getScheduleFromTimeEdit(rooms[i]));
            }
        })


    function getScheduleFromTimeEdit(room) {        
        return timeEdit.getTodaysSchedule(room.name)
        .then((roomSchedule) => {
            let timeEditschedule = {}; 

            //TimeEdit
            if (roomSchedule) {
                timeEditschedule.room = roomSchedule[0].searchId;
                timeEditschedule.available = false;
                timeEditschedule.startTime = roomSchedule[0].time.startTime;
                timeEditschedule.endTime = roomSchedule[0].time.endTime;
            } else {
                timeEditschedule.room = room.name;
                timeEditschedule.available = true;
            }

            return timeEditschedule
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

    function getLastUpdatedScheduleFromDB() {
        return ScheduleModel.find({}).exec()
        .then((schedules) => {
            return schedules;
        }).catch((err) => {
            console.log(err)
        })
    }

    //Körs ej. Används bara för att skrapa grupprummen från lnu.se som är tillgängliga i timeedit
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

    return router;
}
