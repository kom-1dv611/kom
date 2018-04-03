'use strict';

const timeEditApi = require('timeeditApi');
const timeEdit = timeEditApi(
    'https://se.timeedit.net/web/lnu/db1/schema1/', 4                                              
);
const roomSchema = require('../model/Room.js')


let request = require('request');
let router = require("express").Router();


    router.route('/room/:roomID')
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

    router.route('/room/schedule/:roomID')
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

module.exports = router;