'use strict';
const timeEditApi = require('timeeditApi');
const timeEdit = timeEditApi('https://se.timeedit.net/web/lnu/db1/schema1/', 4);
const Scraper = require('./scraper');
module.exports = async (RoomModel) => {
    // Save room if it isn't stored in DB already
    let rooms = await Scraper();
    rooms.map((room) => {
        timeEdit.getTodaysSchedule(room.name)
        .then((roomSchedule) => {
            RoomModel.find({ name: room.name }, (err, data) => {
                if (!err && !data || !err && !data.length) {
                    let groupRoom = new RoomModel({
                        name: room.name,
                        city: room.city,
                        type: room.type,
                        floor_type: room.floor_type,
                        floor_level: room.floor_level,
                        location: room.location
                    });
        
                    groupRoom.save((err, savedRoom) => {
                        if (err) { console.log(err) }
                        if (savedRoom) { console.log('saved room in db') }
                    })
                }
            })
        }).catch((err) => {

        })
    })
    
}
