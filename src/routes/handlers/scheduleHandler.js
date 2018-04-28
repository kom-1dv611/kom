'use strict';

const getEndTimeForBooking = require('../helpers/endTimebooking');

module.exports = class Schedule {
    constructor(ScheduleModel) {
        this.ScheduleModel = ScheduleModel;
    }

    //Ska sätta det "korrekta" schemat i databasen för alla grupprum
    async setCorrectSchedule(room, schedules) {
        let index = schedules.findIndex(x => x.room==room.room.name);   //Tar ut schemats index för det specifika rummet

        let scheduleToSave = new this.ScheduleModel({
            room: room.room.name,
            isAvailable: room.available,
            bookings: room.bookings
        })

        if (index === -1) {
            //Schemat finns ej, skapa det
        } else {
            //Kolla vad som förändrats (t.ex. Jämför mellan senaste sparade schemat och rummet i parametern) och uppdatera schemat med aktuella värden
        }
    }

    //Returns array of schedules from DB
    getSchedulesFromDB() {
        return this.ScheduleModel.find({}).exec()
        .then((schedules) => {
            return schedules.sort((a, b) => a.room.localeCompare(b.room));
        }).catch((err) => {
            console.log(err)
        })
    }
};
