'use strict';     

const timeEditApi = require('timeeditApi');
const timeEdit = timeEditApi(
    'https://se.timeedit.net/web/lnu/db1/schema1/', 4                                              
);

let router = require("express").Router();
    
module.exports = function(RoomModel) {
    

router.route('/')
        .get(function(req, res) {
            res.render('bookroom')
        })
        .post(function(req, res) {
            console.log('rot');

            let data = {
                username: req.body.username,
                room: req.body.roomName,
                bookingLength: req.body.length,
                startTime: req.body.startTime,
            }

            let bookRoom = new RoomModel(data)

            bookRoom.save((err) => {
                console.log('saved')
            })
            
        })

    router.route('/room/:roomID')
        .get(function(req, res) {
            res.render('bookroom');
        })
        .post(function(req, res) {
           res.send({'message': 'saved'})
        })

    router.route('/room/:roomID/schedule/today')
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

