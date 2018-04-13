'use strict';     

const timeEditApi = require('timeeditApi');
const timeEdit = timeEditApi(
    'https://se.timeedit.net/web/lnu/db1/schema1/', 4                                              
);

let router = require("express").Router();
    
module.exports = function(RoomModel) {
    

router.route('/')
        .get(function(req, res) {
            let rooms = [
                {name: "coolRoom", available: false},
                {name: "coolRoom", available: false},
                {name: "coolRoom", available: true},
                {name: "coolRoom", available: false},
                {name: "coolRoom", available: false},
                {name: "coolRoom", available: false},
                {name: "coolRoom", available: false}
            ];
        
            let size = Math.ceil(rooms.length / 3);
            let rows = [];
            for(let i = 0; i < size; i++) {
                rows.push({})
                rows[i].cols = [];
                for(let j = i * 3; j < (i * 3) + 3; j++) {
                    if(rooms[j] != undefined) {
                        rows[i].cols.push(rooms[j]);
                    }
                }
            }
        
            res.render("index", {rows: rows});
        })

    router.route('/:id')
        .get(function(req, res) {
            res.render("room", {room: req.params.id});
        })
        .post(function (req, res) {
            let data = {
                username: req.body.username,
                time: req.body.time
            }

            let bookRoom = new RoomModel(data)
            bookRoom.save((err) => {
                console.log('saved')
            })
            res.redirect('/')
        });

    router.route('/:roomID/schedule/today')
        .get(function (req, res) {
            timeEdit.getTodaysSchedule(req.params.roomID)
            .then((roomSchedule) => {
                let data = {
                    startTime: roomSchedule[0].time.startTime,
                    endTime: roomSchedule[0].time.endTime,
                    bookingID: roomSchedule[0].bookingId,
                    info: roomSchedule[0].columns[2]
                }
                console.log(data);
                res.send(JSON.stringify(data, null, 2));
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
                for(let i = 0; i < schedule.length; i++) {
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
