'use strict';

//Builds table of grouprooms 
module.exports = function(groupRooms) {
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
    return rows;
}
