'use strict';

module.exports = class Schedule {
    constructor(ScheduleModel) {
        this.ScheduleModel = ScheduleModel;
    }

    //Returns array of schedules from DB
    getScheduleFromDB() {
        return this.ScheduleModel.find({}).exec()
        .then((schedules) => {
            return schedules.sort((a, b) => a.room.localeCompare(b.room));
        }).catch((err) => {
            console.log(err)
        })
    }

    //Updates an existing schedule's available property in DB
    updateScheduleDB(schedule, availability) {
        schedule.set({ available: availability });
        schedule.save((err, updatedSchedule) => {
            if (!err) {
                console.log('Updated ' + updatedSchedule.room + ' in DB.')
            }
        })
    }
};
